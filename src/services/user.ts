import { http } from './http';
import type { ApiResponse, PointTransaction } from '../types/api';
import { authStore, UserInfo } from '../store/auth';

export const fetchMe = async () => {
  const { data } = await http.get<ApiResponse<UserInfo>>('/users/me');
  authStore.updateUser(data.data);
  return data.data;
};

export const fetchPointTransactions = async () => {
  const { data } = await http.get<ApiResponse<PointTransaction[]>>('/users/me/point-transactions');
  return data.data;
};
