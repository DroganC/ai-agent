import { config as loadEnv } from 'dotenv';
import { ensureDatabase } from './ensure-database';

/**
 * 数据库初始化入口（抽离自 main.ts）。
 *
 * 与建表的关系：建库与建表不是同步进行的，而是分两步：
 * 1. 本函数（在 create(AppModule) 之前）：只创建“库”（CREATE DATABASE IF NOT EXISTS），不建表。
 * 2. create(AppModule) 时：DatabaseModule 加载，TypeORM 连接该库，若 synchronize 为 true 则按 entities 自动建表/改表。
 *
 * 本函数完成：
 * - 加载 .env、.env.local。
 * - 若 MySQL 中不存在配置的库，则创建该库。
 *
 * @throws 库名非法或 MySQL 不可用时抛出，建议调用方 catch 后打日志并 process.exit(1)
 */
export async function bootstrapDatabase(): Promise<void> {
  loadEnv();
  loadEnv({ path: '.env.local' });

  const portRaw = process.env.MYSQL_PORT ?? '3306';
  const port = Number.parseInt(portRaw, 10);

  await ensureDatabase({
    host: process.env.MYSQL_HOST ?? 'localhost',
    port: Number.isFinite(port) ? port : 3306,
    user: process.env.MYSQL_USERNAME ?? 'root',
    password: process.env.MYSQL_PASSWORD ?? '',
    database: process.env.MYSQL_DATABASE ?? 'ehs_platform',
  });
}
