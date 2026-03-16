import { IsInt, Min } from 'class-validator';

/** 下单请求体：商品 id */
export class CreateOrderDto {
  @IsInt()
  @Min(1, { message: 'item_id 必须为正整数' })
  item_id: number;
}
