import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * 全局 HTTP 异常过滤器（Nest 最佳实践：单一职责，只处理“服务器/鉴权”类错误）。
 * - 业务失败（200 + { failed, code, message }）由各模块 Service 直接返回，不经过此 Filter。
 * - 此处仅处理：HttpException（4xx/5xx）及未捕获异常，统一为 status + JSON body。
 * - 生产环境下 5xx 不向客户端暴露内部错误信息，仅记录日志（本 Filter 在 main 中 new 创建，故用 process.env 读环境）。
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const nodeEnv = process.env.NODE_ENV ?? 'development';

    const status =
      exception instanceof HttpException
        ? (exception as HttpException).getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message: unknown =
      exception instanceof HttpException
        ? (exception as HttpException).getResponse()
        : exception instanceof Error
          ? (exception as Error).message
          : 'Internal Server Error';

    let body: { message: string };
    if (typeof message === 'object' && message !== null && 'message' in message) {
      body = { message: String((message as { message?: string }).message ?? 'Unknown error') };
    } else {
      body = { message: String(message) };
    }
    if (nodeEnv === 'production' && status >= 500) {
      this.logger.error(`${req.method} ${req.url} ${status}`, exception instanceof Error ? exception.stack : String(exception));
      body = { message: 'Internal Server Error' };
    } else {
      this.logger.warn(`${req.method} ${req.url} ${status} ${JSON.stringify(body)}`);
    }
    res.status(status).json(body);
  }
}
