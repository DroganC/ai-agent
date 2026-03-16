import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LearningCategory } from './learning-category.entity';

/** 学习资料表：标题、类型、分类、链接、状态、排序 */
@Entity('learning_materials')
export class LearningMaterial {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  /** 资料标题 */
  @Column({ type: 'varchar', length: 256 })
  title: string;

  /** 资料类型（如视频、文档） */
  @Column({ type: 'varchar', length: 16 })
  type: string;

  @Column({ name: 'category_id', type: 'bigint' })
  category_id: number;

  /** 资料链接或资源地址 */
  @Column({ type: 'varchar', length: 1024 })
  url: string;

  /** 1 启用 0 禁用，仅启用的参与列表 */
  @Column({ type: 'smallint', default: 1 })
  status: number;

  /** 同分类下展示顺序，升序 */
  @Column({ name: 'order_no', type: 'int', default: 0 })
  order_no: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => LearningCategory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: LearningCategory;
}
