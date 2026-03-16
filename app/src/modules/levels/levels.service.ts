import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOperator, In, Like, Repository } from 'typeorm';
import { Level } from '../../entities/level.entity';
import { LevelModule } from '../../entities/level-module.entity';
import { UserLevelBest } from '../../entities/user-level-best.entity';
import { escapeLikePattern } from '../../common/utils/sanitize-search-keyword';

/** 关卡 + 当前用户进度（解锁状态、该关最佳分/用时） */
export interface LevelWithUserProgress {
  id: number;
  module_id: number;
  name: string;
  difficulty: number;
  game_type?: string | null;
  unlock_prev_level_id?: number | null;
  estimated_seconds?: number | null;
  reward_points: number;
  status: number;
  unlocked?: boolean;
  best_score?: number | null;
  best_duration_ms?: number | null;
}

/**
 * 关卡领域服务：按模块查关卡、按 id 查单关；为每条关卡附加当前用户的 unlocked、best_score、best_duration_ms。
 * 解锁规则：无前置关卡或前置关卡已有通过记录（user_level_best 存在）则 unlocked=true。
 */
@Injectable()
export class LevelsService {
  constructor(
    @InjectRepository(Level) private readonly levelRepo: Repository<Level>,
    @InjectRepository(LevelModule) private readonly moduleRepo: Repository<LevelModule>,
    @InjectRepository(UserLevelBest) private readonly userLevelBestRepo: Repository<UserLevelBest>,
  ) {}

  /** 某模块下的关卡列表（仅 status=1），并附加当前用户进度；支持按关卡名称模糊查询 */
  async findLevelsByModuleId(
    moduleId: number,
    userId?: number,
    nameKeyword?: string,
  ): Promise<LevelWithUserProgress[]> {
    const where: { module_id: number; status: number; name?: FindOperator<string> } = {
      module_id: moduleId,
      status: 1,
    };
    if (nameKeyword) {
      where.name = Like(`%${escapeLikePattern(nameKeyword)}%`) as FindOperator<string>;
    }
    const levels = await this.levelRepo.find({
      where,
      order: { id: 'ASC' },
    });
    return this.attachUserProgress(levels, userId);
  }

  /** 单关详情，并附加当前用户进度 */
  async findLevelById(
    id: number,
    userId?: number,
  ): Promise<LevelWithUserProgress | null> {
    const level = await this.levelRepo.findOne({ where: { id } });
    if (!level) return null;
    const [one] = await this.attachUserProgress([level], userId);
    return one ?? null;
  }

  /**
   * 为关卡列表附加用户进度：查 user_level_best，得到“已通过关卡 id 集合”；每条关卡 unlocked = 无前置或前置已通过，best_* 从 bestMap 取。
   */
  private async attachUserProgress(
    levels: Level[],
    userId?: number,
  ): Promise<LevelWithUserProgress[]> {
    if (!userId || levels.length === 0) {
      return levels.map((l) => ({
        ...this.toLevelDto(l),
        unlocked: l.unlock_prev_level_id == null,
        best_score: undefined,
        best_duration_ms: undefined,
      }));
    }
    const levelIds = levels.map((l) => l.id);
    const bests = await this.userLevelBestRepo.find({
      where: { user_id: userId, level_id: In(levelIds) },
    });
    const bestMap = new Map<number, UserLevelBest>(
      bests.map((b: UserLevelBest) => [b.level_id, b]),
    );
    const passedLevelIds = new Set(bests.map((b: UserLevelBest) => b.level_id));

    const result: LevelWithUserProgress[] = [];
    for (const l of levels) {
      const best: UserLevelBest | undefined = bestMap.get(l.id);
      const unlocked =
        l.unlock_prev_level_id == null ||
        passedLevelIds.has(l.unlock_prev_level_id);
      result.push({
        ...this.toLevelDto(l),
        unlocked,
        best_score: best?.best_score ?? undefined,
        best_duration_ms: best?.best_duration_ms ?? undefined,
      });
    }
    return result;
  }

  private toLevelDto(
    l: Level,
  ): Omit<LevelWithUserProgress, 'unlocked' | 'best_score' | 'best_duration_ms'> {
    return {
      id: l.id,
      module_id: l.module_id,
      name: l.name,
      difficulty: l.difficulty,
      game_type: l.game_type,
      unlock_prev_level_id: l.unlock_prev_level_id,
      estimated_seconds: l.estimated_seconds,
      reward_points: l.reward_points,
      status: l.status,
    };
  }

  /** 校验模块 id 存在，供 Controller 在返回 404 前使用 */
  async findModuleById(id: number): Promise<boolean> {
    const mod = await this.moduleRepo.findOne({ where: { id } });
    return !!mod;
  }
}
