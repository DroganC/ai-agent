import { http } from './http';
import type { ApiResponse, PointTransaction } from '../types/api';
import type { UserInfo } from '../stores/authStore';
import { storeRef } from '../stores/storeRef.js';

export const fetchMe = async () => {
  const { data } = await http.get<ApiResponse<UserInfo>>('/users/me');
  if (storeRef) storeRef.authStore.updateUser(data.data);
  return data.data;
};

export const fetchPointTransactions = async () => {
  const { data } = await http.get<ApiResponse<PointTransaction[]>>('/users/me/point-transactions');
  return data.data;
};
