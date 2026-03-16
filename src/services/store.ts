/**
 * 积分商城相关接口：商品列表、下单、订单列表。
 */
import { http } from './http';
import { getApiPrefix } from './prefix';
import { ApiResponse, StoreItem, StoreOrder } from '../types/api';
import { v4 as uuid } from 'uuid';
import { USE_MOCK } from '../config/env';
import { mockCreateOrder, mockFetchItems, mockFetchOrders } from '../mocks/api';

/**
 * 拉取积分商城在售商品列表（仅 status=on）。
 * @returns 商品列表（含积分价格、库存等）
 */
export const fetchItems = async () => {
  if (USE_MOCK) return mockFetchItems();
  const { data } = await http.get<ApiResponse<StoreItem[]>>({ url: getApiPrefix('store/items'), params: { status: 'on' } });
  return data.data;
};

/**
 * 使用积分兑换指定商品，扣减积分并生成订单。
 * @param itemId - 商品 ID
 * @returns 新建的订单
 */
export const createOrder = async (itemId: number) => {
  if (USE_MOCK) return mockCreateOrder(itemId);
  const { data } = await http.post<ApiResponse<StoreOrder>>({
    url: getApiPrefix('store/orders'),
    data: { itemId },
    headers: { 'x-idempotency-key': uuid() },
  });
  return data.data;
};

/**
 * 拉取当前用户的积分兑换订单列表。
 * @returns 订单列表
 */
export const fetchOrders = async () => {
  if (USE_MOCK) return mockFetchOrders();
  const { data } = await http.get<ApiResponse<StoreOrder[]>>({ url: getApiPrefix('store/orders') });
  return data.data;
};
