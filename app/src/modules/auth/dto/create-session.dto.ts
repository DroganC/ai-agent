import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 创建会话请求体：第三方/统一登录回调得到的授权码。
 */
export class CreateSessionDto {
  @IsString()
  @IsNotEmpty({ message: '授权码不能为空' })
  code: string;
}
