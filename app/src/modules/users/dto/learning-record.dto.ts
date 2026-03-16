import { IsInt, IsIn, Min } from 'class-validator';

/** 学习记录请求体：资料 id 与学习状态 */
export class CreateLearningRecordDto {
  @IsInt()
  @Min(1, { message: 'material_id 必须为正整数' })
  material_id: number;

  @IsIn(['viewed', 'completed'], { message: 'status 必须为 viewed 或 completed' })
  status: 'viewed' | 'completed';
}
