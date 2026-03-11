import { http } from './http';
import type { ApiResponse } from '../types/api';
import type { UserInfo } from '../stores/authStore';
import { storeRef } from '../stores/storeRef.js';
import { USE_MOCK } from '../config/env';
import { mockAuthExchangeCode } from '../mocks/api';

export const exchangeComeCode = async (code: string) => {
  if (USE_MOCK) {
    const data = await mockAuthExchangeCode(code);
    if (storeRef) storeRef.authStore.setAuth(data.token, data.user);
    return data;
  }
  const { data } = await http.get<ApiResponse<{ token: string; user: UserInfo }>>('/auth/come/callback', { params: { code } });
  if (storeRef) storeRef.authStore.setAuth(data.data.token, data.data.user);
  return data.data;
};

export const logout = () => storeRef?.authStore.logout();
