/**
 * 业务失败统一响应体（与后端技术方案 4.2 一致）。
 * HTTP 仍为 200，前端通过 failed === true 判断并展示 message 或按 code 做多语言。
 */
export class FailedResponseDto {
  failed: true = true;
  code: string;
  message: string;

  constructor(code: string, message: string) {
    this.code = code;
    this.message = message;
  }
}
