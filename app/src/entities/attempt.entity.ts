import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Level } from './level.entity';

/** 挑战记录表：某用户某关的一次挑战，含状态、开始/结束时间、得分、用时、错误次数等 */
@Entity('attempts')
export class Attempt {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  user_id: number;

  @Column({ name: 'level_id', type: 'bigint' })
  level_id: number;

  /** in_progress | passed | failed | aborted，结算时更新 */
  @Column({ type: 'varchar', length: 20 })
  status: string;

  /** 挑战开始时间 */
  @Column({ name: 'start_at', type: 'datetime' })
  start_at: Date;

  /** 挑战结束时间，结算时写入 */
  @Column({ name: 'end_at', type: 'datetime', nullable: true })
  end_at: Date | null;

  /** 本次挑战用时（毫秒），结算时写入 */
  @Column({ name: 'duration_ms', type: 'bigint', nullable: true })
  duration_ms: number | null;

  /** 本次得分，通过时参与 user_level_best 与 total_score 计算 */
  @Column({ type: 'int', nullable: true })
  score: number | null;

  /** 失败原因：timeout | key_error | manual_abort | other */
  @Column({ name: 'fail_reason', type: 'varchar', length: 20, nullable: true })
  fail_reason: string | null;

  /** 步骤错误次数（含非关键错误） */
  @Column({ name: 'error_count', type: 'int', default: 0 })
  error_count: number;

  /** 关键错误次数，影响是否判定失败 */
  @Column({ name: 'key_error_count', type: 'int', default: 0 })
  key_error_count: number;

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
