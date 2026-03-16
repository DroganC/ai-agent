import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { LevelsService } from './levels.service';
import { FailedResponseDto } from '../../common/dto/failed-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

/**
 * 关卡控制器：GET /levels/:id，返回单关详情（含当前用户解锁与最佳成绩）。
 */
@Controller('levels')
@UseGuards(JwtAuthGuard)
export class LevelsController {
  constructor(private readonly levelsService: LevelsService) {}

  @Get(':id')
  async getLevel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: JwtPayload,
  ) {
    const level = await this.levelsService.findLevelById(id, payload.sub);
    if (!level) {
      return new FailedResponseDto('LEVEL_NOT_FOUND', '关卡不存在');
    }
    return level;
  }
}
