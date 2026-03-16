import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

/** 幂等键表：同一 key+scope 重复请求时返回已有 resource_id，用于创建挑战、结算、复活、下单等 */
@Entity('idempotency_keys')
export class IdempotencyKey {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  /** 客户端传入的幂等键，如 x-idempotency-key 头，同一 key+scope 仅生效一次 */
  @Column({ type: 'varchar', length: 64, unique: true })
  key: string;

  @Column({ name: 'user_id', type: 'bigint' })
  user_id: number;

  /** 业务范围：attempt_create | attempt_settle | revive | store_order */
  @Column({ type: 'varchar', length: 32 })
  scope: string;

  /** 首次请求创建的资源 id（如 attempt_id、order_id），重复请求时据此返回已创建资源 */
  @Column({ name: 'resource_id', type: 'bigint', nullable: true })
  resource_id: number | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
