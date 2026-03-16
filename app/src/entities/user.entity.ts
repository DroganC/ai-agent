import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Department } from './department.entity';
import { Base } from './base.entity';

/** 用户表：登录身份（external_id）、姓名、部门/基地、积分、总分、最佳用时等 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  /** 第三方/统一登录唯一标识，会话创建时以 code 作为 external_id 查用户 */
  @Column({ name: 'external_id', type: 'varchar', length: 128, unique: true })
  external_id: string;

  /** 用户昵称/姓名，新用户默认 用户_${external_id 前 8 位} */
  @Column({ type: 'varchar', length: 64 })
  name: string;

  /** 所属部门 id，可选 */
  @Column({ name: 'department_id', type: 'bigint', nullable: true })
  department_id: number | null;

  /** 所属基地 id，可选 */
  @Column({ name: 'base_id', type: 'bigint', nullable: true })
  base_id: number | null;

  /** 累计关卡得分总和，用于排行榜 */
  @Column({ name: 'total_score', type: 'int', default: 0 })
  total_score: number;

  /** 全局最佳通关总用时（毫秒），排行榜次序用 */
  @Column({ name: 'best_duration_ms', type: 'bigint', nullable: true })
  best_duration_ms: number | null;

  /** 当前积分，可用于复活、兑换商品 */
  @Column({ type: 'int', default: 0 })
  points: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department | null;

  @ManyToOne(() => Base, { nullable: true })
  @JoinColumn({ name: 'base_id' })
  base: Base | null;
}
