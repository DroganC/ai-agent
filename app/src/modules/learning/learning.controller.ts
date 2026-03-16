import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LearningService } from './learning.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { sanitizeSearchKeyword } from '../../common/utils/sanitize-search-keyword';

/**
 * 学习控制器：GET /learning/categories、GET /learning/materials；支持 name/title 模糊查询。
 */
@Controller('learning')
@UseGuards(JwtAuthGuard)
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @Get('categories')
  async getCategories(@Query('name') name?: string) {
    const keyword = sanitizeSearchKeyword(name);
    return this.learningService.findCategories(keyword);
  }

  @Get('materials')
  async getMaterials(
    @Query('category_id') categoryId?: string,
    @Query('title') title?: string,
  ) {
    const parsed = categoryId ? parseInt(categoryId, 10) : NaN;
    const id = Number.isFinite(parsed) ? parsed : undefined;
    const keyword = sanitizeSearchKeyword(title);
    return this.learningService.findMaterials(id, keyword);
  }
}
