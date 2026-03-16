import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/** 单条步骤事件：类型、步骤 id、知识点、错误类型、是否关键错误、时间戳 */
export class AttemptEventItemDto {
  event_type: string;
  step_id: string;
  knowledge_point?: string;
  error_type?: string;
  is_key_error?: boolean;
  ts?: string;
}

/** 批量上报挑战步骤事件 */
export class AttemptEventsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttemptEventItemDto)
  events: AttemptEventItemDto[];
}
