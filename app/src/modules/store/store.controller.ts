import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StoreService } from './store.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { sanitizeSearchKeyword } from '../../common/utils/sanitize-search-keyword';

/**
 * 商城控制器：GET /store/items?status=，仅做参数解析与 Service 调用。
 */
@Controller('store')
@UseGuards(JwtAuthGuard)
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get('items')
  async getItems(
    @Query('status') status?: string,
    @Query('name') name?: string,
  ) {
    const keyword = sanitizeSearchKeyword(name);
    return this.storeService.findItems(status, keyword);
  }
}
