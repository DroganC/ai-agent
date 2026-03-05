import { http } from './http';
import { ApiResponse, StoreItem, StoreOrder } from '../types/api';
import { v4 as uuid } from 'uuid';

export const fetchItems = async () => {
  const { data } = await http.get<ApiResponse<StoreItem[]>>('/store/items', { params: { status: 'on' } });
  return data.data;
};

export const createOrder = async (itemId: number) => {
  const { data } = await http.post<ApiResponse<StoreOrder>>(
    '/store/orders',
    { itemId },
    { headers: { 'x-idempotency-key': uuid() } }
  );
  return data.data;
};

export const fetchOrders = async () => {
  const { data } = await http.get<ApiResponse<StoreOrder[]>>('/store/orders');
  return data.data;
};
