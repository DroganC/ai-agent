import { http } from './http';
import { ApiResponse, StoreItem, StoreOrder } from '../types/api';
import { v4 as uuid } from 'uuid';
import { USE_MOCK } from '../config/env';
import { mockCreateOrder, mockFetchItems, mockFetchOrders } from '../mocks/api';

export const fetchItems = async () => {
  if (USE_MOCK) return mockFetchItems();
  const { data } = await http.get<ApiResponse<StoreItem[]>>('/store/items', { params: { status: 'on' } });
  return data.data;
};

export const createOrder = async (itemId: number) => {
  if (USE_MOCK) return mockCreateOrder(itemId);
  const { data } = await http.post<ApiResponse<StoreOrder>>(
    '/store/orders',
    { itemId },
    { headers: { 'x-idempotency-key': uuid() } }
  );
  return data.data;
};

export const fetchOrders = async () => {
  if (USE_MOCK) return mockFetchOrders();
  const { data } = await http.get<ApiResponse<StoreOrder[]>>('/store/orders');
  return data.data;
};
