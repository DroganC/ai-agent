/**
 * 统一配置入口（NestJS 推荐：ConfigModule.load 从单一来源读取环境变量与默认值）。
 * 在 ConfigModule.forRoot 的 load 数组中注册，应用内通过 ConfigService.get('key') 或 get('database.port') 使用。
 * 注意：bootstrap-database 在 Nest 创建前执行，仍直接使用 process.env，不经过本配置。
 */
export default () => {
  const portRaw = process.env.PORT ?? '3000';
  const portNum = parseInt(portRaw, 10);
  const port =
    Number.isFinite(portNum) && portNum > 0 && portNum <= 65535 ? portNum : 3000;

  const mysqlPortRaw = process.env.MYSQL_PORT ?? '3306';
  const mysqlPort = parseInt(mysqlPortRaw, 10);

  return {
    port,
    database: {
      host: process.env.MYSQL_HOST ?? 'localhost',
      port: Number.isFinite(mysqlPort) ? mysqlPort : 3306,
      username: process.env.MYSQL_USERNAME ?? 'root',
      password: process.env.MYSQL_PASSWORD ?? '',
      database: process.env.MYSQL_DATABASE ?? 'ehs_platform',
    },
    jwt: {
      secret: process.env.JWT_SECRET ?? 'ehs-dev-secret-change-in-prod',
      expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    },
    nodeEnv: process.env.NODE_ENV ?? 'development',
  };
};
