import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { bootstrapDatabase } from './database/bootstrap-database';

const logger = new Logger('Bootstrap');

/**
 * 应用入口：先初始化数据库（见 database/bootstrap-database.ts），再创建 Nest 应用并监听端口。
 * 数据库与表的初始化逻辑已抽离至 database 目录，此处仅负责应用层启动。
 */
async function bootstrap(): Promise<void> {
  await bootstrapDatabase();

  const app = await NestFactory.create(AppModule);

  // 全局 API 前缀，与前端 VITE_API_BASE=/api/v1 一致
  app.setGlobalPrefix('api/v1');

  // 全局异常过滤器：将未捕获异常与 HttpException 转为统一 HTTP 状态码 + JSON body
  app.useGlobalFilters(new HttpExceptionFilter());

  // 全局校验管道：whitelist 剥离未声明字段；transform 自动转换 query/body 类型；生产可设 forbidNonWhitelisted: true 拒绝多余字段
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = app.get(ConfigService);
  const port = config.get<number>('port', 3000);
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/api/v1`);
}

/** 启动失败（如数据库不可用、端口占用）时打日志并退出，避免静默挂起 */
bootstrap().catch((err) => {
  logger.error('Bootstrap failed', err);
  process.exit(1);
});
