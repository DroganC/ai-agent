import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  Department,
  Base,
  User,
  UserLife,
  PointTransaction,
  Scene,
  LevelModule,
  Level,
  Attempt,
  AttemptEvent,
  UserLevelBest,
  LearningCategory,
  LearningMaterial,
  LearningRecord,
  StoreItem,
  StoreOrder,
  IdempotencyKey,
} from '../entities';

/**
 * 数据库模块：TypeORM 与 MySQL 连接配置及实体注册。
 *
 * 初始化分工（建库与建表是两步，不同步进行）：
 * - “库”：由 database/bootstrap-database.ts 在 create(AppModule) 之前执行，只建库不建表。
 * - “表”：本模块在应用启动时，TypeORM 连接上库后，根据 synchronize 与 entities 建表/改表（见下）。
 *
 * 新增表的方式（开发环境 synchronize: true 时）：
 * 1. 在 entities/ 下新增实体类（如 xxx.entity.ts）。
 * 2. 在 entities/index.ts 中导出，并在本模块的 entities 数组中注册该实体。
 * 3. 重启应用；TypeORM 会对比实体与现有表，自动执行 CREATE TABLE 或 ALTER TABLE。
 * 生产环境应关闭 synchronize，使用 TypeORM 迁移（migration）管理表结构变更。
 *
 * synchronize：TypeORM 默认值为 false。本项目在非生产环境显式设为 true 以便自动建表/同步；生产必须 false。
 * migration（迁移）：版本化的 SQL/脚本，按顺序执行以变更表结构（建表、加列、改类型等）；可代码评审、可回滚，适合生产环境表结构变更。
 * entities：所有实体，TypeORM 据此生成表。
 * timezone / charset：与 MySQL 一致。
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const db = config.get<{ host: string; port: number; username: string; password: string; database: string }>('database')!;
        return {
          type: 'mysql' as const,
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.database,
          /** 注册所有实体，synchronize 为 true 时会按此生成/更新表 */
          entities: [
            Department,
            Base,
            User,
            UserLife,
            PointTransaction,
            Scene,
            LevelModule,
            Level,
            Attempt,
            AttemptEvent,
            UserLevelBest,
            LearningCategory,
            LearningMaterial,
            LearningRecord,
            StoreItem,
            StoreOrder,
            IdempotencyKey,
          ],
          /**
           * synchronize 默认值为 false（TypeORM 官方默认）。true 时每次连接根据 entities 自动建表/改表/可能删列。
           * 生产必须 false；表结构变更用 migration：按版本执行 SQL，可审查、可回滚。
           */
          synchronize: config.get<string>('nodeEnv') !== 'production',
          timezone: '+08:00',
          charset: 'utf8mb4',
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
