import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningController } from './learning.controller';
import { LearningService } from './learning.service';
import { LearningCategory } from '../../entities/learning-category.entity';
import { LearningMaterial } from '../../entities/learning-material.entity';

/**
 * 学习模块：学习分类列表、学习资料列表（可按 category_id 筛选），只读接口。
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([LearningCategory, LearningMaterial]),
  ],
  controllers: [LearningController],
  providers: [LearningService],
  exports: [LearningService],
})
export class LearningModule {}
