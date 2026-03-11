import { http } from './http';
import type { ApiResponse, PointTransaction } from '../types/api';
import type { UserInfo } from '../stores/authStore';
import { storeRef } from '../stores/storeRef.js';
import { USE_MOCK } from '../config/env';
import { mockFetchMe, mockFetchPointTransactions } from '../mocks/api';

export const fetchMe = async () => {
  if (USE_MOCK) {
    const data = await mockFetchMe();
    if (storeRef) storeRef.authStore.updateUser(data);
    return data;
  }
  const { data } = await http.get<ApiResponse<UserInfo>>('/users/me');
  if (storeRef) storeRef.authStore.updateUser(data.data);
  return data.data;
};

export const fetchPointTransactions = async () => {
  if (USE_MOCK) return mockFetchPointTransactions();
  const { data } = await http.get<ApiResponse<PointTransaction[]>>('/users/me/point-transactions');
  return data.data;
};
