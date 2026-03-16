import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { SettleAttemptDto } from './dto/settle-attempt.dto';
import { AttemptEventsDto } from './dto/attempt-events.dto';

/**
 * 挑战控制器：POST /attempts、POST /attempts/:id/events、PATCH /attempts/:id、GET /attempts/:id/review。
 * 仅做参数解析与 Service 调用，幂等键从 Header x-idempotency-key 读取。
 */
@Controller('attempts')
@UseGuards(JwtAuthGuard)
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post()
  async create(
    @CurrentUser() payload: JwtPayload,
    @Body() dto: CreateAttemptDto,
    @Headers('x-idempotency-key') idempotencyKey?: string,
  ) {
    return this.attemptsService.create(payload.sub, dto, idempotencyKey);
  }

  @Post(':id/events')
  async sendEvents(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: JwtPayload,
    @Body() dto: AttemptEventsDto,
  ) {
    await this.attemptsService.sendEvents(id, payload.sub, dto.events);
    return {};
  }

  @Patch(':id')
  async settle(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: JwtPayload,
    @Body() dto: SettleAttemptDto,
    @Headers('x-idempotency-key') idempotencyKey?: string,
  ) {
    return this.attemptsService.settle(id, payload.sub, dto, idempotencyKey);
  }

  @Get(':id/review')
  async getReview(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.attemptsService.getReview(id, payload.sub);
  }
}
