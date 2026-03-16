/**
 * 当前用户相关接口：个人信息、积分流水。
 * 拉取 /users/me 后会同步更新 authStore 中的用户信息。
 */
import { http } from './http';
import { getApiPrefix } from './prefix';
import type { ApiResponse, PointTransaction } from '../types/api';
import type { UserInfo } from '../stores/authStore';
import { storeRef } from '../stores/storeRef.js';
import { USE_MOCK } from '../config/env';
import { mockFetchMe, mockFetchPointTransactions } from '../mocks/api';

/**
 * 拉取当前登录用户信息，并写入 authStore。
 * @returns 用户信息（含积分、生命等）
 */
export const fetchMe = async () => {
  if (USE_MOCK) {
    const data = await mockFetchMe();
    if (storeRef) storeRef.authStore.updateUser(data);
    return data;
  }
  const { data } = await http.get<ApiResponse<UserInfo>>({ url: getApiPrefix('users/me') });
  if (storeRef) storeRef.authStore.updateUser(data.data);
  return data.data;
};

/**
 * 拉取当前用户的积分变动记录（用于个人页积分明细等）。
 * @returns 积分流水列表
 */
export const fetchPointTransactions = async () => {
  if (USE_MOCK) return mockFetchPointTransactions();
  const { data } = await http.get<ApiResponse<PointTransaction[]>>({ url: getApiPrefix('users/me/point-transactions') });
  return data.data;
};
