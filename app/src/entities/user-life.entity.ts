import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

/** 用户生命值表：当前生命、每日重置日期、当日复活已用/上限，用于闯关与复活逻辑 */
@Entity('user_life')
export class UserLife {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint', unique: true })
  user_id: number;

  /** 当前生命值，闯关失败扣 1；跨日或复活 +1，上限 3 */
  @Column({ name: 'life_count', type: 'smallint', default: 3 })
  life_count: number;

  /** 最近一次“每日重置”的日期 YYYY-MM-DD，跨日时重置生命与今日复活次数 */
  @Column({ name: 'daily_reset_date', type: 'date' })
  daily_reset_date: string;

  /** 当日已使用复活次数 */
  @Column({ name: 'today_revive_used', type: 'smallint', default: 0 })
  today_revive_used: number;

  /** 当日复活次数上限（如 3） */
  @Column({ name: 'today_revive_limit', type: 'smallint', default: 3 })
  today_revive_limit: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
