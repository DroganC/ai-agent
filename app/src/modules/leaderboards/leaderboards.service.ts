import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { escapeLikePattern } from '../../common/utils/sanitize-search-keyword';

/** 排行榜单项：用户 id、姓名、部门名、总分、最佳用时、排名、是否当前用户 */
export interface LeaderboardItem {
  user_id: number;
  name: string;
  department_name?: string;
  total_score: number;
  best_duration_ms: number;
  rank: number;
  is_me?: boolean;
}

/**
 * 排行榜领域服务：按 total_score 降序、best_duration_ms 升序分页查 User，关联部门名；rank 为当前页内序号，is_me 标记当前用户。
 * 支持按用户姓名模糊查询；scope/game_id/department_id 预留。
 */
@Injectable()
export class LeaderboardsService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async getLeaderboard(
    userId: number,
    _scope?: string,
    _gameId?: number,
    _departmentId?: number,
    page = 1,
    pageSize = 20,
    nameKeyword?: string,
  ): Promise<{ items: LeaderboardItem[]; updated_at: string }> {
    const qb = this.userRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.department', 'd')
      .orderBy('u.total_score', 'DESC')
      .addOrderBy('(u.best_duration_ms IS NULL)', 'ASC')
      .addOrderBy('u.best_duration_ms', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize);
    if (nameKeyword) {
      const pattern = `%${escapeLikePattern(nameKeyword)}%`;
      qb.andWhere('u.name LIKE :nameKeyword', { nameKeyword: pattern });
    }
    // best_duration_ms 为 NULL 时排到末尾，非 NULL 按用时升序
    const users = await qb.getMany();
    const items: LeaderboardItem[] = users.map((u: User, i: number) => ({
      user_id: u.id,
      name: u.name,
      department_name: u.department?.name,
      total_score: u.total_score,
      best_duration_ms: u.best_duration_ms ?? 0,
      rank: (page - 1) * pageSize + i + 1,
      is_me: u.id === userId,
    }));
    return {
      items,
      updated_at: new Date().toISOString(),
    };
  }
}
