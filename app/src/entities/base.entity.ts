import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/** 基地表：与用户关联，用于组织架构与展示 */
@Entity('bases')
export class Base {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  /** 基地名称 */
  @Column({ type: 'varchar', length: 128 })
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
