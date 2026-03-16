import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { StoreItem } from '../../entities/store-item.entity';

/**
 * 商城模块：商品列表查询，支持按 status 筛选（如 status=on 表示上架）；下单在 Users 模块 POST /users/me/orders。
 */
@Module({
  imports: [TypeOrmModule.forFeature([StoreItem])],
  controllers: [StoreController],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule {}
