import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LevelModule } from './level-module.entity';

/** 关卡表：所属模块、名称、难度、游戏类型、解锁前置、奖励积分、状态等 */
@Entity('levels')
export class Level {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'module_id', type: 'bigint' })
  module_id: number;

  @Column({ type: 'varchar', length: 256 })
  name: string;

  /** 难度等级，数字越大越难 */
  @Column({ type: 'smallint', default: 1 })
  difficulty: number;

  /** 游戏类型标识，前端据此渲染不同玩法 */
  @Column({ name: 'game_type', type: 'varchar', length: 32, nullable: true })
  game_type: string | null;

  /** 解锁前置关卡 id，null 表示第一关直接可玩 */
  @Column({ name: 'unlock_prev_level_id', type: 'bigint', nullable: true })
  unlock_prev_level_id: number | null;

  /** 预估完成时间（秒），展示用 */
  @Column({ name: 'estimated_seconds', type: 'int', nullable: true })
  estimated_seconds: number | null;

  /** 通过后奖励积分 */
  @Column({ name: 'reward_points', type: 'int', default: 0 })
  reward_points: number;

  /** 1 启用 0 禁用，仅 status=1 的关卡参与列表与解锁逻辑 */
  @Column({ type: 'smallint', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => LevelModule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module: LevelModule;
}
