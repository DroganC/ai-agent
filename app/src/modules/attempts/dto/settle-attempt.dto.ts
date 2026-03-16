import { IsOptional, IsString, IsIn, IsInt, IsNumber, Min } from 'class-validator';

/** 结算挑战请求体：状态、结束时间、用时、得分、失败原因、错误计数等，均为可选 */
export class SettleAttemptDto {
  @IsOptional()
  @IsString()
  @IsIn(['in_progress', 'passed', 'failed', 'aborted'])
  status?: string;

  @IsOptional()
  end_at?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration_ms?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  score?: number;

  @IsOptional()
  @IsString()
  @IsIn(['timeout', 'key_error', 'manual_abort', 'other'])
  fail_reason?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  error_count?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  key_error_count?: number;
}
