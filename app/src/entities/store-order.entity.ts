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
import { StoreItem } from './store-item.entity';

/** 商城订单表：用户、商品、消耗积分、状态，积分兑换记录 */
@Entity('store_orders')
export class StoreOrder {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  user_id: number;

  @Column({ name: 'item_id', type: 'bigint' })
  item_id: number;

  /** 订单状态，如 fulfilled（已兑换） */
  @Column({ type: 'varchar', length: 32 })
  status: string;

  /** 下单时扣减的积分 */
  @Column({ name: 'cost_points', type: 'int' })
  cost_points: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => StoreItem, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'item_id' })
  item: StoreItem;
}
