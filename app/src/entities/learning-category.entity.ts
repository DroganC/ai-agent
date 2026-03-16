import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/** 学习分类表：可选父级、名称、排序，学习资料分类列表 */
@Entity('learning_categories')
export class LearningCategory {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  /** 父分类 id，null 表示顶级分类 */
  @Column({ name: 'parent_id', type: 'bigint', nullable: true })
  parent_id: number | null;

  /** 分类名称 */
  @Column({ type: 'varchar', length: 128 })
  name: string;

  /** 列表展示顺序，升序 */
  @Column({ name: 'order_no', type: 'int', default: 0 })
  order_no: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
