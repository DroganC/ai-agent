import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * JWT 解析后的载荷，由 JwtStrategy.validate() 注入到 request.user。
 */
export interface JwtPayload {
  sub: number;
  external_id?: string;
}

/**
 * 当前用户参数装饰器：从 request.user 读取 JWT 解析结果（含 sub = userId）。
 * 用法：@CurrentUser() payload: JwtPayload 或 @CurrentUser('sub') userId: number。
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;
    /** 未挂 JwtAuthGuard 或校验未通过时 user 可能缺失，兜底避免运行时报错 */
    if (!user) return { sub: 0 };
    return user;
  },
);
