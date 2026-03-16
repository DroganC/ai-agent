import { createConnection } from 'mysql2/promise';
import { Logger } from '@nestjs/common';

const logger = new Logger('EnsureDatabase');

/**
 * 数据库名合法性校验：仅允许字母、数字、下划线。
 * 用于防止 SQL 注入及非法标识符（如含空格、连字符、分号等）。
 */
const DB_NAME_REGEX = /^[a-zA-Z0-9_]+$/;

/**
 * 在 TypeORM 连接前执行：若 MySQL 中不存在配置的数据库，则自动创建。
 *
 * 职责说明：
 * - 仅负责“库”的创建（CREATE DATABASE IF NOT EXISTS），不建表。
 * - 建表由 DatabaseModule 在应用启动时通过 TypeORM 的 synchronize（开发环境）或迁移完成。
 *
 * 执行流程：
 * 1. 校验 database 名称（非空、仅允许字母/数字/下划线）。
 * 2. 对库名中的反引号转义，避免拼入 SQL 时破坏语法。
 * 3. 使用 mysql2 连接 MySQL 服务（不指定 database），执行建库语句后关闭连接。
 *
 * @param options 与 .env 中 MYSQL_* 对应：host、port、user、password、database
 * @throws 库名非法或 MySQL 连接/执行失败时抛出，由调用方决定是否终止进程
 */
export async function ensureDatabase(options: {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}): Promise<void> {
  const db = options.database.trim();
  if (!db || !DB_NAME_REGEX.test(db)) {
    throw new Error(
      'MYSQL_DATABASE must be a non-empty alphanumeric identifier (letters, numbers, underscore only)',
    );
  }
  // MySQL 标识符中反引号需转义为两个反引号，否则 CREATE DATABASE 语法错误或注入风险
  const escapedDb = db.replace(/`/g, '``');

  let conn;
  try {
    conn = await createConnection({
      host: options.host,
      port: options.port,
      user: options.user,
      password: options.password,
      // 不指定 database：连接到 MySQL 服务即可，建库前无需选中具体库
    });
    await conn.execute(
      `CREATE DATABASE IF NOT EXISTS \`${escapedDb}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    logger.log(`Database \`${db}\` ready.`);
  } catch (err) {
    logger.warn(
      'Ensure database failed (check MySQL is running and credentials):',
      (err as Error).message,
    );
    throw err;
  } finally {
    await conn?.end();
  }
}
