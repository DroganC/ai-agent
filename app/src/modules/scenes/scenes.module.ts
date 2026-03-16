import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScenesController } from './scenes.controller';
import { ScenesService } from './scenes.service';
import { Scene } from '../../entities/scene.entity';
import { LevelModule as LevelModuleEntity } from '../../entities/level-module.entity';

/**
 * 场景模块：场景列表、场景下的模块列表。只读接口，供首页/关卡入口使用。
 */
@Module({
  imports: [TypeOrmModule.forFeature([Scene, LevelModuleEntity])],
  controllers: [ScenesController],
  providers: [ScenesService],
  exports: [ScenesService],
})
export class ScenesModule {}
