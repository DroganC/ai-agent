import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOperator, Like, Repository } from 'typeorm';
import { LearningCategory } from '../../entities/learning-category.entity';
import { LearningMaterial } from '../../entities/learning-material.entity';
import { escapeLikePattern } from '../../common/utils/sanitize-search-keyword';

/**
 * 学习领域服务：分类与资料均为只读；分类按 order_no 升序；资料可按 category_id、标题模糊筛选，仅 status=1，按 order_no 升序。
 */
@Injectable()
export class LearningService {
  constructor(
    @InjectRepository(LearningCategory)
    private readonly categoryRepo: Repository<LearningCategory>,
    @InjectRepository(LearningMaterial)
    private readonly materialRepo: Repository<LearningMaterial>,
  ) {}

  /** 所有学习分类，按 order_no 升序；支持按名称模糊查询 */
  async findCategories(nameKeyword?: string): Promise<LearningCategory[]> {
    const where: { name?: FindOperator<string> } = {};
    if (nameKeyword) {
      where.name = Like(`%${escapeLikePattern(nameKeyword)}%`) as FindOperator<string>;
    }
    return this.categoryRepo.find({
      where,
      order: { order_no: 'ASC' },
    });
  }

  /** 学习资料：传 category_id 时只返回该分类下 status=1 的；支持按标题模糊查询；均按 order_no 升序 */
  async findMaterials(categoryId?: number, titleKeyword?: string): Promise<LearningMaterial[]> {
    const where: { category_id?: number; status: number; title?: FindOperator<string> } = {
      status: 1,
    };
    if (categoryId != null) where.category_id = categoryId;
    if (titleKeyword) where.title = Like(`%${escapeLikePattern(titleKeyword)}%`) as FindOperator<string>;
    return this.materialRepo.find({
      where,
      order: { order_no: 'ASC' },
    });
  }
}
