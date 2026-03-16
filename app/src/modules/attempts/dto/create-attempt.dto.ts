import { IsInt, Min } from 'class-validator';

/** 创建挑战请求体：指定要挑战的关卡 id */
export class CreateAttemptDto {
  @IsInt()
  @Min(1)
  level_id: number;
}
