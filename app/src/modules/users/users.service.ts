import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UserLife } from '../../entities/user-life.entity';
import { PointTransaction } from '../../entities/point-transaction.entity';
import { StoreOrder } from '../../entities/store-order.entity';
import { StoreItem } from '../../entities/store-item.entity';
import { LearningRecord } from '../../entities/learning-record.entity';
import { LearningMaterial } from '../../entities/learning-material.entity';
import { IdempotencyKey } from '../../entities/idempotency-key.entity';
import { AuthService, UserInfo } from '../auth/auth.service';
import { FailedResponseDto } from '../../common/dto/failed-response.dto';

/** 事务内库存扣减失败时抛出，用于回滚并返回 OUT_OF_STOCK */
const OUT_OF_STOCK_ERROR = new Error('OUT_OF_STOCK');
/** 积分复活消耗点数 */
const REVIVE_POINTS_COST = 50;
/** 生命值上限及每日重置后的默认值 */
const MAX_LIFE = 3;

/**
 * 用户领域服务：当前用户信息、积分流水、生命值/复活、订单、学习记录。
 * 遵循 Nest 最佳实践：业务逻辑集中在此，Controller 仅做入参解析与调用。
 */
@Injectable()
export class UsersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly authService: AuthService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(UserLife) private readonly userLifeRepo: Repository<UserLife>,
    @InjectRepository(PointTransaction) private readonly pointTxRepo: Repository<PointTransaction>,
    @InjectRepository(StoreOrder) private readonly orderRepo: Repository<StoreOrder>,
    @InjectRepository(StoreItem) private readonly storeItemRepo: Repository<StoreItem>,
    @InjectRepository(LearningRecord) private readonly learningRecordRepo: Repository<LearningRecord>,
    @InjectRepository(LearningMaterial) private readonly learningMaterialRepo: Repository<LearningMaterial>,
    @InjectRepository(IdempotencyKey) private readonly idemRepo: Repository<IdempotencyKey>,
  ) {}

  /** 委托 AuthService 按 userId 组装 UserInfo（含部门、基地、生命值） */
  async getMe(userId: number): Promise<UserInfo | null> {
    return this.authService.validateUserBySub(userId);
  }

  /** 积分流水：按用户分页，倒序（最新在前） */
  async getPointTransactions(
    userId: number,
    limit = 20,
    offset = 0,
  ): Promise<PointTransaction[]> {
    return this.pointTxRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * 生命值信息：先执行“跨日重置”逻辑，再返回当前 life_count、今日复活已用/上限。
   */
  async getLife(userId: number): Promise<{
    life_count: number;
    daily_reset_date: string;
    today_revive_used: number;
    today_revive_limit: number;
  } | null> {
    await this.maybeResetDailyLife(userId);
    const life = await this.userLifeRepo.findOne({ where: { user_id: userId } });
    if (!life) return null;
    return {
      life_count: life.life_count,
      daily_reset_date: life.daily_reset_date,
      today_revive_used: life.today_revive_used,
      today_revive_limit: life.today_revive_limit,
    };
  }

  /**
   * 跨日重置：若 daily_reset_date 与今日不同，则重置生命值为 MAX_LIFE、今日复活次数为 0。
   */
  private async maybeResetDailyLife(userId: number): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);
    const life = await this.userLifeRepo.findOne({ where: { user_id: userId } });
    if (!life) return;
    if (life.daily_reset_date !== today) {
      life.daily_reset_date = today;
      life.today_revive_used = 0;
      life.life_count = MAX_LIFE;
      await this.userLifeRepo.save(life);
    }
  }

  /**
   * 复活：先幂等校验（同 key 直接返回当前生命信息）；再校验今日复活次数、若 type=points 扣积分；最后 +1 生命并记录今日复活次数。
   */
  async revive(
    userId: number,
    type: 'task' | 'points',
    idempotencyKey?: string,
  ): Promise<
    | { life_count: number; daily_reset_date: string; today_revive_used: number; today_revive_limit: number }
    | FailedResponseDto
  > {
    await this.maybeResetDailyLife(userId);
    if (idempotencyKey) {
      const existing = await this.idemRepo.findOne({
        where: { key: idempotencyKey, scope: 'revive' },
      });
      if (existing?.user_id === userId) {
        const life = await this.getLife(userId);
        if (life) return life;
      }
    }

    const life = await this.userLifeRepo.findOne({ where: { user_id: userId } });
    if (!life) return new FailedResponseDto('USER_NOT_FOUND', '用户不存在');
    if (life.today_revive_used >= life.today_revive_limit) {
      return new FailedResponseDto('REVIVE_LIMIT_REACHED', '今日复活次数已达上限');
    }
    if (type === 'points') {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user || user.points < REVIVE_POINTS_COST) {
        return new FailedResponseDto('INSUFFICIENT_POINTS', '积分不足');
      }
      await this.dataSource.transaction(async (tx: EntityManager) => {
        await tx.getRepository(User).update(userId, {
          points: user.points - REVIVE_POINTS_COST,
        });
        await tx.getRepository(PointTransaction).save(
          tx.getRepository(PointTransaction).create({
            user_id: userId,
            change: -REVIVE_POINTS_COST,
            balance_after: user.points - REVIVE_POINTS_COST,
            reason: 'revive_points',
          }),
        );
      });
    }
    life.life_count = Math.min(MAX_LIFE, life.life_count + 1);
    life.today_revive_used += 1;
    await this.userLifeRepo.save(life);
    if (idempotencyKey) {
      await this.idemRepo.save(
        this.idemRepo.create({
          key: idempotencyKey,
          user_id: userId,
          scope: 'revive',
          resource_id: null,
        }),
      );
    }
    const result = await this.getLife(userId);
    // 刚保存过 life，理论上必存在；若异常则用当前内存值兜底，避免返回 undefined
    return result ?? {
      life_count: life.life_count,
      daily_reset_date: life.daily_reset_date,
      today_revive_used: life.today_revive_used,
      today_revive_limit: life.today_revive_limit,
    };
  }

  /** 当前用户订单列表，分页倒序 */
  async getOrders(userId: number, limit = 20, offset = 0): Promise<StoreOrder[]> {
    return this.orderRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * 下单：幂等（同 key 返回已有订单）；校验商品存在、上架、库存；扣用户积分与库存；写订单与积分流水；记录幂等 key。
   */
  async createOrder(
    userId: number,
    itemId: number,
    idempotencyKey?: string,
  ): Promise<StoreOrder | FailedResponseDto> {
    if (idempotencyKey) {
      const existing = await this.idemRepo.findOne({
        where: { key: idempotencyKey, scope: 'store_order' },
      });
      if (existing?.resource_id && existing.user_id === userId) {
        const order = await this.orderRepo.findOne({
          where: { id: existing.resource_id, user_id: userId },
        });
        if (order) return order;
      }
    }

    const item = await this.storeItemRepo.findOne({ where: { id: itemId } });
    if (!item) return new FailedResponseDto('ITEM_NOT_FOUND', '商品不存在');
    if (item.status !== 1) return new FailedResponseDto('ITEM_NOT_FOUND', '商品已下架');
    if (item.stock < 1) return new FailedResponseDto('OUT_OF_STOCK', '库存不足');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || user.points < item.cost_points) {
      return new FailedResponseDto('INSUFFICIENT_POINTS', '积分不足');
    }

    const newPoints = user.points - item.cost_points;
    try {
      const saved = await this.dataSource.transaction(async (tx: EntityManager) => {
        // 条件更新库存，避免并发超卖：仅当 stock >= 1 时扣减
        const stockResult = await tx.getRepository(StoreItem).createQueryBuilder()
          .update(StoreItem)
          .set({ stock: () => 'stock - 1' })
          .where('id = :id', { id: itemId })
          .andWhere('stock >= 1')
          .execute();
        if (stockResult.affected === 0) throw OUT_OF_STOCK_ERROR;

        await tx.getRepository(User).update(userId, { points: newPoints });
        const order = tx.getRepository(StoreOrder).create({
          user_id: userId,
          item_id: itemId,
          status: 'fulfilled',
          cost_points: item.cost_points,
        });
        const orderSaved = await tx.getRepository(StoreOrder).save(order);
        await tx.getRepository(PointTransaction).save(
          tx.getRepository(PointTransaction).create({
            user_id: userId,
            change: -item.cost_points,
            balance_after: newPoints,
            reason: 'redeem',
          }),
        );
        if (idempotencyKey) {
          await tx.getRepository(IdempotencyKey).save(
            tx.getRepository(IdempotencyKey).create({
              key: idempotencyKey,
              user_id: userId,
              scope: 'store_order',
              resource_id: orderSaved.id,
            }),
          );
        }
        return orderSaved;
      });
      return saved;
    } catch (err) {
      if (err === OUT_OF_STOCK_ERROR) {
        return new FailedResponseDto('OUT_OF_STOCK', '库存不足');
      }
      throw err;
    }
  }

  /**
   * 学习记录：校验资料存在；若已有记录则更新 status，否则插入新记录（唯一约束 user_id + material_id）。
   */
  async createLearningRecord(
    userId: number,
    materialId: number,
    status: 'viewed' | 'completed',
  ): Promise<void | FailedResponseDto> {
    const material = await this.learningMaterialRepo.findOne({ where: { id: materialId } });
    if (!material) return new FailedResponseDto('MATERIAL_NOT_FOUND', '资料不存在');

    const existing = await this.learningRecordRepo.findOne({
      where: { user_id: userId, material_id: materialId },
    });
    if (existing) {
      existing.status = status;
      await this.learningRecordRepo.save(existing);
    } else {
      await this.learningRecordRepo.save(
        this.learningRecordRepo.create({
          user_id: userId,
          material_id: materialId,
          status,
        }),
      );
    }
  }
}
