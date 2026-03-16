import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Attempt } from '../../entities/attempt.entity';
import { AttemptEvent } from '../../entities/attempt-event.entity';
import { User } from '../../entities/user.entity';
import { UserLevelBest } from '../../entities/user-level-best.entity';
import { PointTransaction } from '../../entities/point-transaction.entity';
import { Level } from '../../entities/level.entity';
import { IdempotencyKey } from '../../entities/idempotency-key.entity';
import { FailedResponseDto } from '../../common/dto/failed-response.dto';

/**
 * 挑战领域服务：创建挑战（含幂等）、上报步骤事件、结算（通过时更新积分与最佳记录）、回放时间线。
 */
@Injectable()
export class AttemptsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Attempt) private readonly attemptRepo: Repository<Attempt>,
    @InjectRepository(AttemptEvent) private readonly eventRepo: Repository<AttemptEvent>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(UserLevelBest) private readonly userLevelBestRepo: Repository<UserLevelBest>,
    @InjectRepository(PointTransaction) private readonly pointTxRepo: Repository<PointTransaction>,
    @InjectRepository(Level) private readonly levelRepo: Repository<Level>,
    @InjectRepository(IdempotencyKey) private readonly idemRepo: Repository<IdempotencyKey>,
  ) {}

  /**
   * 创建一次挑战。若传幂等键且已存在同 key 的 attempt_create 记录，则直接返回已创建的 Attempt。
   * 校验关卡存在且当前用户已解锁（无前置或前置已通过）；创建 attempt 后写入幂等表。
   */
  async create(
    userId: number,
    dto: { level_id: number },
    idempotencyKey?: string,
  ): Promise<Attempt | FailedResponseDto> {
    if (idempotencyKey) {
      const existing = await this.idemRepo.findOne({
        where: { key: idempotencyKey, scope: 'attempt_create' },
      });
      if (existing?.resource_id && existing.user_id === userId) {
        const attempt = await this.attemptRepo.findOne({
          where: { id: existing.resource_id, user_id: userId },
        });
        if (attempt) return attempt;
      }
    }

    const level = await this.levelRepo.findOne({ where: { id: dto.level_id } });
    if (!level) return new FailedResponseDto('LEVEL_NOT_FOUND', '关卡不存在');

    const unlocked = await this.checkLevelUnlocked(userId, level.unlock_prev_level_id);
    if (!unlocked) return new FailedResponseDto('LEVEL_LOCKED', '关卡未解锁');

    const attempt = this.attemptRepo.create({
      user_id: userId,
      level_id: dto.level_id,
      status: 'in_progress',
      start_at: new Date(),
      error_count: 0,
      key_error_count: 0,
    });
    const saved = await this.attemptRepo.save(attempt);
    if (idempotencyKey) {
      await this.idemRepo.save(
        this.idemRepo.create({
          key: idempotencyKey,
          user_id: userId,
          scope: 'attempt_create',
          resource_id: saved.id,
        }),
      );
    }
    return saved;
  }

  /** 是否已解锁：无前置关卡或前置关卡已有 user_level_best 记录 */
  private async checkLevelUnlocked(
    userId: number,
    unlockPrevLevelId: number | null,
  ): Promise<boolean> {
    if (unlockPrevLevelId == null) return true;
    const best = await this.userLevelBestRepo.findOne({
      where: { user_id: userId, level_id: unlockPrevLevelId },
    });
    return !!best;
  }

  /**
   * 批量写入挑战步骤事件；仅当 attempt 属于当前用户且 status=in_progress 时写入，否则静默返回。
   */
  async sendEvents(
    attemptId: number,
    userId: number,
    events: Array<{
      event_type: string;
      step_id: string;
      knowledge_point?: string;
      error_type?: string;
      is_key_error?: boolean;
      ts?: string;
    }>,
  ): Promise<void> {
    const attempt = await this.attemptRepo.findOne({
      where: { id: attemptId, user_id: userId },
    });
    if (!attempt) throw new NotFoundException('挑战不存在');
    if (attempt.status !== 'in_progress') return;

    for (const e of events) {
      await this.eventRepo.save(
        this.eventRepo.create({
          attempt_id: attemptId,
          event_type: e.event_type,
          step_id: e.step_id,
          knowledge_point: e.knowledge_point ?? null,
          error_type: e.error_type ?? null,
          is_key_error: e.is_key_error ?? false,
          ts: e.ts ? new Date(e.ts) : null,
        }),
      );
    }
  }

  /**
   * 结算挑战：更新 attempt 状态与字段；若 status=passed，在同一事务内：
   * 增加用户 points、total_score，写入 point_transactions（reason=level_pass）；
   * 更新或插入 user_level_best（取最高分、最短用时）。
   * 若传幂等键且本次结算已执行过（同 key 的 attempt_settle 且 resource_id=attemptId），直接返回原 attempt。
   */
  async settle(
    attemptId: number,
    userId: number,
    dto: {
      status?: string;
      end_at?: string;
      duration_ms?: number;
      score?: number;
      fail_reason?: string;
      error_count?: number;
      key_error_count?: number;
    },
    idempotencyKey?: string,
  ): Promise<Attempt | FailedResponseDto> {
    const attempt = await this.attemptRepo.findOne({
      where: { id: attemptId, user_id: userId },
      relations: ['level'],
    });
    if (!attempt) return new FailedResponseDto('ATTEMPT_NOT_FOUND', '挑战不存在');
    if (attempt.status !== 'in_progress') {
      if (idempotencyKey) {
        const existing = await this.idemRepo.findOne({
          where: { key: idempotencyKey, scope: 'attempt_settle' },
        });
        if (existing?.resource_id === attemptId && existing.user_id === userId) return attempt;
      }
      return new FailedResponseDto('ATTEMPT_ALREADY_SETTLED', '挑战已结算');
    }

    let endAt = new Date();
    if (dto.end_at) {
      const parsed = new Date(dto.end_at);
      if (Number.isFinite(parsed.getTime())) endAt = parsed;
    }
    const status = dto.status ?? attempt.status;

    await this.dataSource.transaction(async (tx: EntityManager) => {
      // 更新 attempt 字段
      attempt.status = status;
      attempt.end_at = endAt;
      if (dto.duration_ms != null) attempt.duration_ms = dto.duration_ms;
      if (dto.score != null) attempt.score = dto.score;
      if (dto.fail_reason != null) attempt.fail_reason = dto.fail_reason;
      if (dto.error_count != null) attempt.error_count = dto.error_count;
      if (dto.key_error_count != null) attempt.key_error_count = dto.key_error_count;
      await tx.getRepository(Attempt).save(attempt);

      // 通过时：加积分、记流水、更新/插入 user_level_best
      if (status === 'passed' && attempt.level) {
        const level = attempt.level;
        const user = await tx.getRepository(User).findOne({ where: { id: userId } });
        if (user) {
          const reward = level.reward_points ?? 0;
          const newPoints = user.points + reward;
          const newTotal = user.total_score + (attempt.score ?? 0);
          await tx.getRepository(User).update(userId, {
            points: newPoints,
            total_score: newTotal,
          });
          await tx.getRepository(PointTransaction).insert({
            user_id: userId,
            change: reward,
            balance_after: newPoints,
            reason: 'level_pass',
          });

          let best = await tx.getRepository(UserLevelBest).findOne({
            where: { user_id: userId, level_id: level.id },
          });
          const now = new Date();
          if (!best) {
            await tx.getRepository(UserLevelBest).insert({
              user_id: userId,
              level_id: level.id,
              best_score: attempt.score ?? 0,
              best_duration_ms: attempt.duration_ms ?? 0,
              achieved_at: now,
            });
          } else {
            const newBestScore = Math.max(best.best_score ?? 0, attempt.score ?? 0);
            const newBestDur =
              best.best_duration_ms != null && attempt.duration_ms != null
                ? Math.min(best.best_duration_ms, attempt.duration_ms)
                : (attempt.duration_ms ?? best.best_duration_ms);
            await tx.getRepository(UserLevelBest).update(best.id, {
              best_score: newBestScore,
              best_duration_ms: newBestDur,
              achieved_at: now,
            });
          }
        }
      }

      if (idempotencyKey) {
        await tx.getRepository(IdempotencyKey).save(
          tx.getRepository(IdempotencyKey).create({
            key: idempotencyKey,
            user_id: userId,
            scope: 'attempt_settle',
            resource_id: attemptId,
          }),
        );
      }
    });

    const updated = await this.attemptRepo.findOne({ where: { id: attemptId } });
    return updated ?? attempt;
  }

  /**
   * 回放：按 created_at 排序取该挑战的所有事件，组装为 timeline（ts、step、result、knowledge_point）。
   */
  async getReview(
    attemptId: number,
    userId: number,
  ): Promise<
    | { timeline: Array<{ ts: string; step: string; result: string; knowledge_point?: string }> }
    | FailedResponseDto
  > {
    const attempt = await this.attemptRepo.findOne({
      where: { id: attemptId, user_id: userId },
    });
    if (!attempt) return new FailedResponseDto('ATTEMPT_NOT_FOUND', '挑战不存在');

    const events = await this.eventRepo.find({
      where: { attempt_id: attemptId },
      order: { created_at: 'ASC' },
    });
    const timeline = events.map((e: AttemptEvent) => ({
      ts: (e.ts ?? e.created_at).toISOString(),
      step: e.step_id,
      result: e.event_type === 'step_ok' ? 'ok' : 'error',
      knowledge_point: e.knowledge_point ?? undefined,
    }));
    return { timeline };
  }
}
