import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { LevelsService } from './levels.service';
import { FailedResponseDto } from '../../common/dto/failed-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { sanitizeSearchKeyword } from '../../common/utils/sanitize-search-keyword';

/**
 * 模块控制器：GET /modules/:id/levels，返回某模块下的关卡列表（含当前用户进度）；支持 name 模糊查询。
 */
@Controller('modules')
@UseGuards(JwtAuthGuard)
export class ModulesController {
  constructor(private readonly levelsService: LevelsService) {}

  @Get(':id/levels')
  async getLevels(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: JwtPayload,
    @Query('name') name?: string,
  ) {
    const exists = await this.levelsService.findModuleById(id);
    if (!exists) {
      return new FailedResponseDto('MODULE_NOT_FOUND', '模块不存在');
    }
    const keyword = sanitizeSearchKeyword(name);
    return this.levelsService.findLevelsByModuleId(id, payload.sub, keyword);
  }
}
