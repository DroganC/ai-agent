import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/** 商城商品表：名称、类型、所需积分、库存、状态、封面等 */
@Entity('store_items')
export class StoreItem {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  /** 商品名称 */
  @Column({ type: 'varchar', length: 128 })
  name: string;

  /** 商品类型标识 */
  @Column({ type: 'varchar', length: 16 })
  type: string;

  /** 兑换所需积分 */
  @Column({ name: 'cost_points', type: 'int' })
  cost_points: number;

  /** 库存，兑换时扣减 */
  @Column({ type: 'int', default: 0 })
  stock: number;

  /** 1 上架 0 下架，仅上架商品可兑换 */
  @Column({ type: 'smallint', default: 1 })
  status: number;

  /** 封面图 URL，可选 */
  @Column({ name: 'cover_url', type: 'varchar', length: 512, nullable: true })
  cover_url: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
