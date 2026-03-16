import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ScenesService } from './scenes.service';
import { FailedResponseDto } from '../../common/dto/failed-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { sanitizeSearchKeyword } from '../../common/utils/sanitize-search-keyword';

/**
 * 场景控制器：GET /scenes、GET /scenes/:id/modules，仅做参数解析与 Service 调用。
 */
@Controller('scenes')
@UseGuards(JwtAuthGuard)
export class ScenesController {
  constructor(private readonly scenesService: ScenesService) {}

  @Get()
  async findAll(@Query('name') name?: string) {
    const keyword = sanitizeSearchKeyword(name);
    return this.scenesService.findAll(keyword);
  }

  @Get(':id/modules')
  async getModules(
    @Param('id', ParseIntPipe) id: number,
    @Query('name') name?: string,
  ) {
    const scene = await this.scenesService.findSceneById(id);
    if (!scene) {
      return new FailedResponseDto('SCENE_NOT_FOUND', '场景不存在');
    }
    const keyword = sanitizeSearchKeyword(name);
    return this.scenesService.findModulesBySceneId(id, keyword);
  }
}
