import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Scene } from './scene.entity';

/** 关卡模块表：归属场景、名称、排序，场景下的模块列表 */
@Entity('level_modules')
export class LevelModule {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'scene_id', type: 'bigint' })
  scene_id: number;

  /** 模块名称 */
  @Column({ type: 'varchar', length: 128 })
  name: string;

  /** 同场景下展示顺序，升序 */
  @Column({ name: 'order_no', type: 'int', default: 0 })
  order_no: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => Scene, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scene_id' })
  scene: Scene;
}
