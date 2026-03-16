import { IsIn } from 'class-validator';

/** 复活请求体：task 为任务复活，points 为消耗积分复活 */
export class ReviveDto {
  @IsIn(['task', 'points'], { message: 'type 必须为 task 或 points' })
  type: 'task' | 'points';
}
