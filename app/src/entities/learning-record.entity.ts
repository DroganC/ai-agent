import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { LearningMaterial } from './learning-material.entity';

@Entity('learning_records')
/** 用户学习记录表：某用户某资料的阅读状态（viewed/completed），唯一约束 user_id+material_id */
@Unique(['user_id', 'material_id'])
export class LearningRecord {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  user_id: number;

  @Column({ name: 'material_id', type: 'bigint' })
  material_id: number;

  /** 学习状态：viewed 已浏览 | completed 已完成 */
  @Column({ type: 'varchar', length: 20 })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => LearningMaterial, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'material_id' })
  material: LearningMaterial;
}
