import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/** 部门表：与用户关联，用于组织架构与排行榜展示 */
@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  /** 部门名称 */
  @Column({ type: 'varchar', length: 128 })
  name: string;

  /** 部门编码，可选 */
  @Column({ type: 'varchar', length: 64, nullable: true })
  code: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
