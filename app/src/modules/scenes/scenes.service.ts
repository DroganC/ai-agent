import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOperator, Like, Repository } from 'typeorm';
import { Scene } from '../../entities/scene.entity';
import { LevelModule } from '../../entities/level-module.entity';
import { escapeLikePattern } from '../../common/utils/sanitize-search-keyword';

/**
 * 场景领域服务：仅负责场景与模块的查询，无写操作。
 */
@Injectable()
export class ScenesService {
  constructor(
    @InjectRepository(Scene) private readonly sceneRepo: Repository<Scene>,
    @InjectRepository(LevelModule) private readonly moduleRepo: Repository<LevelModule>,
  ) {}

  /** 所有场景，按 order_no 升序；支持按名称模糊查询 */
  async findAll(nameKeyword?: string): Promise<Scene[]> {
    const where: { name?: FindOperator<string> } = {};
    if (nameKeyword) {
      where.name = Like(`%${escapeLikePattern(nameKeyword)}%`) as FindOperator<string>;
    }
    return this.sceneRepo.find({
      where,
      order: { order_no: 'ASC' },
    });
  }

  /** 指定场景下的模块列表，按 order_no 升序；支持按模块名称模糊查询 */
  async findModulesBySceneId(sceneId: number, nameKeyword?: string): Promise<LevelModule[]> {
    const where: { scene_id: number; name?: FindOperator<string> } = { scene_id: sceneId };
    if (nameKeyword) {
      where.name = Like(`%${escapeLikePattern(nameKeyword)}%`) as FindOperator<string>;
    }
    return this.moduleRepo.find({
      where,
      order: { order_no: 'ASC' },
    });
  }

  /** 按 id 查场景，用于校验场景存在后再返回模块 */
  async findSceneById(id: number): Promise<Scene | null> {
    return this.sceneRepo.findOne({ where: { id } });
  }
}
