import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOperator, Like, Repository } from 'typeorm';
import { StoreItem } from '../../entities/store-item.entity';
import { escapeLikePattern } from '../../common/utils/sanitize-search-keyword';

/**
 * 商城领域服务：商品列表只读；status=on 时只返回 status=1（上架），否则返回全部；支持按名称模糊查询，按 id 升序。
 */
@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(StoreItem) private readonly itemRepo: Repository<StoreItem>,
  ) {}

  /** 商品列表：可选按 status 筛选（on -> status=1）、按名称模糊查询，按 id 升序 */
  async findItems(status?: string, nameKeyword?: string): Promise<StoreItem[]> {
    const where: { status?: number; name?: FindOperator<string> } = {};
    if (status === 'on') where.status = 1;
    if (nameKeyword) where.name = Like(`%${escapeLikePattern(nameKeyword)}%`) as FindOperator<string>;
    return this.itemRepo.find({
      where,
      order: { id: 'ASC' },
    });
  }
}
