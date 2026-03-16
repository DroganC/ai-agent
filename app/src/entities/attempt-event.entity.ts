import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Attempt } from './attempt.entity';

/** 挑战步骤事件表：某次挑战内的步骤记录（类型、步骤 id、知识点、是否关键错误、时间等），用于回放 */
@Entity('attempt_events')
export class AttemptEvent {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'attempt_id', type: 'bigint' })
  attempt_id: number;

  /** 如 step_ok / step_error，与前端约定一致 */
  @Column({ name: 'event_type', type: 'varchar', length: 20 })
  event_type: string;

  /** 步骤唯一标识，回放时间线按此展示 */
  @Column({ name: 'step_id', type: 'varchar', length: 64 })
  step_id: string;

  /** 关联知识点，可选 */
  @Column({ name: 'knowledge_point', type: 'varchar', length: 256, nullable: true })
  knowledge_point: string | null;

  /** 错误类型，错误事件时可选填 */
  @Column({ name: 'error_type', type: 'varchar', length: 32, nullable: true })
  error_type: string | null;

  /** 是否关键错误，影响 key_error_count 与失败判定 */
  @Column({ name: 'is_key_error', type: 'boolean', default: false })
  is_key_error: boolean;

  /** 客户端上报的事件时间，缺省则用 created_at */
  @Column({ type: 'datetime', nullable: true })
  ts: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => Attempt, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attempt_id' })
  attempt: Attempt;
}
