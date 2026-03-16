import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../../../common/decorators/current-user.decorator';

/**
 * JWT 策略：从 Authorization: Bearer <token> 解析出 payload，再按 sub 校验用户存在并注入 request.user。
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret', 'ehs-dev-secret-change-in-prod'),
    });
  }

  /** 校验通过后仅向 request.user 注入 { sub: userId }，供 @CurrentUser() 与业务使用 */
  async validate(payload: { sub?: string }): Promise<JwtPayload> {
    const sub = Number(payload?.sub);
    if (!Number.isFinite(sub) || sub < 1) {
      throw new UnauthorizedException();
    }
    const user = await this.authService.validateUserBySub(sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return { sub: user.id };
  }
}
