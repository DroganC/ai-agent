import { Controller, Post, Body } from '@nestjs/common';
import { AuthService, SessionResult } from './auth.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { FailedResponseDto } from '../../common/dto/failed-response.dto';

/**
 * 认证控制器：仅负责接收请求、调用 AuthService、返回结果，不包含业务逻辑。
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 用 code 创建会话（换 token），成功返回 { token, user }，业务失败返回 200 + FailedResponseDto。
   */
  @Post('sessions')
  async createSession(
    @Body() dto: CreateSessionDto,
  ): Promise<SessionResult | FailedResponseDto> {
    return this.authService.createSession(dto.code);
  }
}
