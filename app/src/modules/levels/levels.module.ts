import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LevelsController } from './levels.controller';
import { ModulesController } from './modules.controller';
import { LevelsService } from './levels.service';
import { Level } from '../../entities/level.entity';
import { LevelModule as LevelModuleEntity } from '../../entities/level-module.entity';
import { UserLevelBest } from '../../entities/user-level-best.entity';

/**
 * 关卡模块：模块下的关卡列表、关卡详情。返回数据附带当前用户解锁状态与最佳成绩（unlocked、best_score、best_duration_ms）。
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Level, LevelModuleEntity, UserLevelBest]),
  ],
  controllers: [LevelsController, ModulesController],
  providers: [LevelsService],
  exports: [LevelsService],
})
export class LevelsModule {}
