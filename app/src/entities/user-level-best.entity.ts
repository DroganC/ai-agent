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
import { Level } from './level.entity';

@Entity('user_level_best')
/** 用户关卡最佳记录表：某用户某关的最高分、最短用时，用于解锁下一关与展示 */
@Unique(['user_id', 'level_id'])
export class UserLevelBest {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  user_id: number;

  @Column({ name: 'level_id', type: 'bigint' })
  level_id: number;

  /** 该关历史最高分 */
  @Column({ name: 'best_score', type: 'int', nullable: true })
  best_score: number | null;

  /** 该关历史最短用时（毫秒） */
  @Column({ name: 'best_duration_ms', type: 'bigint', nullable: true })
  best_duration_ms: number | null;

  /** 最近一次更新该记录的时间 */
  @Column({ name: 'achieved_at', type: 'datetime' })
  achieved_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Level, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'level_id' })
  level: Level;
}
