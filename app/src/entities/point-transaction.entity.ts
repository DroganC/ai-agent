import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

/** 积分流水表：变动额、变动后余额、原因（level_pass / revive_points / redeem 等） */
@Entity('point_transactions')
export class PointTransaction {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  user_id: number;

  /** 本次变动额，正为增加（如过关奖励）、负为消耗（复活/兑换） */
  @Column({ type: 'int' })
  change: number;

  /** 变动后用户积分余额 */
  @Column({ name: 'balance_after', type: 'int' })
  balance_after: number;

  /** 变动原因：level_pass | revive_points | redeem */
  @Column({ type: 'varchar', length: 64 })
  reason: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
