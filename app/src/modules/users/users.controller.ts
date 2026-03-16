import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { FailedResponseDto } from '../../common/dto/failed-response.dto';
import { parseLimit, parseOffset } from '../../common/utils/parse-query';
import { ReviveDto } from './dto/revive.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateLearningRecordDto } from './dto/learning-record.dto';

/**
 * 用户控制器：仅做参数解析与 Service 调用，业务逻辑在 UsersService。
 * 所有接口均需 JWT，路径为 /users/me 及其子资源。
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() payload: JwtPayload) {
    const user = await this.usersService.getMe(payload.sub);
    if (!user) return new FailedResponseDto('USER_NOT_FOUND', '用户不存在');
    return user;
  }

  @Get('me/point-transactions')
  @UseGuards(JwtAuthGuard)
  async getPointTransactions(
    @CurrentUser() payload: JwtPayload,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.usersService.getPointTransactions(
      payload.sub,
      parseLimit(limit),
      parseOffset(offset),
    );
  }

  @Get('me/life')
  @UseGuards(JwtAuthGuard)
  async getLife(@CurrentUser() payload: JwtPayload) {
    const life = await this.usersService.getLife(payload.sub);
    if (!life) return new FailedResponseDto('USER_NOT_FOUND', '用户不存在');
    return life;
  }

  @Post('me/revives')
  @UseGuards(JwtAuthGuard)
  async revive(
    @CurrentUser() payload: JwtPayload,
    @Body() dto: ReviveDto,
    @Headers('x-idempotency-key') idempotencyKey?: string,
  ) {
    return this.usersService.revive(payload.sub, dto.type, idempotencyKey);
  }

  @Get('me/orders')
  @UseGuards(JwtAuthGuard)
  async getOrders(
    @CurrentUser() payload: JwtPayload,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.usersService.getOrders(
      payload.sub,
      parseLimit(limit),
      parseOffset(offset),
    );
  }

  @Post('me/orders')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @CurrentUser() payload: JwtPayload,
    @Body() dto: CreateOrderDto,
    @Headers('x-idempotency-key') idempotencyKey?: string,
  ) {
    return this.usersService.createOrder(payload.sub, dto.item_id, idempotencyKey);
  }

  @Post('me/learning-records')
  @UseGuards(JwtAuthGuard)
  async createLearningRecord(
    @CurrentUser() payload: JwtPayload,
    @Body() dto: CreateLearningRecordDto,
  ) {
    const result = await this.usersService.createLearningRecord(
      payload.sub,
      dto.material_id,
      dto.status,
    );
    if (result && 'failed' in result) return result;
    return {};
  }
}
