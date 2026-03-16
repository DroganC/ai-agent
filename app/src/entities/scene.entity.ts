import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/** 场景表：首页场景列表，含 code、名称、封面、排序 */
@Entity('scenes')
export class Scene {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  /** 场景唯一编码 */
  @Column({ type: 'varchar', length: 32, unique: true })
  code: string;

  /** 场景名称 */
  @Column({ type: 'varchar', length: 128 })
  name: string;

  /** 封面图 URL，可选 */
  @Column({ name: 'cover_url', type: 'varchar', length: 512, nullable: true })
  cover_url: string | null;

  /** 列表展示顺序，升序 */
  @Column({ name: 'order_no', type: 'int', default: 0 })
  order_no: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
