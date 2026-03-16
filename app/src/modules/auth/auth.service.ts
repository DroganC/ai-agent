import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UserLife } from '../../entities/user-life.entity';
import { FailedResponseDto } from '../../common/dto/failed-response.dto';

/** 返回给前端的用户摘要，与接口文档一致 */
export interface UserInfo {
  id: number;
  name: string;
  department_name?: string;
  base_name?: string;
  total_score?: number;
  best_duration_ms?: number;
  points?: number;
  life?: number;
}

/** 创建会话成功时的响应体 */
export interface SessionResult {
  token: string;
  user: UserInfo;
}

/**
 * 认证服务：会话创建（code → 用户查找/创建 → JWT）、JWT 校验时按 sub 解析用户。
 * 业务逻辑集中在此，Controller 保持“薄层”。
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(UserLife) private readonly userLifeRepo: Repository<UserLife>,
  ) {}

  /**
   * 用 code 创建会话：以 code 作为 external_id 查用户，不存在则创建用户并初始化 user_life，再签发 JWT 并返回 UserInfo。
   */
  async createSession(code: string): Promise<SessionResult | FailedResponseDto> {
    const trimmed = code?.trim();
    if (!trimmed) {
      return new FailedResponseDto('INVALID_CODE', '授权码不能为空');
    }

    const today = new Date().toISOString().slice(0, 10);
    let user = await this.userRepo.findOne({
      where: { external_id: trimmed },
      relations: ['department', 'base'],
    });

    if (!user) {
      // 新用户：创建 users 记录并初始化 user_life（生命值 3、今日复活 0/3）
      user = this.userRepo.create({
        external_id: trimmed,
        name: `用户_${trimmed.slice(0, 8)}`,
        department_id: null,
        base_id: null,
        total_score: 0,
        points: 0,
      });
      user = await this.userRepo.save(user);
      const life = this.userLifeRepo.create({
        user_id: user.id,
        life_count: 3,
        daily_reset_date: today,
        today_revive_used: 0,
        today_revive_limit: 3,
      });
      await this.userLifeRepo.save(life);
    }

    const token = this.jwtService.sign(
      { sub: user.id },
      { subject: String(user.id) },
    );
    const userInfo = await this.toUserInfo(user.id);
    if (!userInfo) {
      return new FailedResponseDto('USER_NOT_FOUND', '用户不存在');
    }
    return { token, user: userInfo };
  }

  /**
   * JWT 校验时由 JwtStrategy 调用：按 sub（userId）组装 UserInfo，供 Guard 注入 request.user 及 /users/me 使用。
   */
  async validateUserBySub(sub: number): Promise<UserInfo | null> {
    return this.toUserInfo(sub);
  }

  /**
   * 根据 userId 组装接口所需的 UserInfo（含部门/基地名称、生命值）。
   */
  private async toUserInfo(userId: number): Promise<UserInfo | null> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['department', 'base'],
    });
    if (!user) return null;
    const life = await this.userLifeRepo.findOne({
      where: { user_id: userId },
    });
    const lifeCount = life?.life_count ?? 3;
    return {
      id: user.id,
      name: user.name,
      department_name: user.department?.name ?? undefined,
      base_name: user.base?.name ?? undefined,
      total_score: user.total_score,
      best_duration_ms: user.best_duration_ms ?? undefined,
      points: user.points,
      life: lifeCount,
    };
  }
}
