import { http } from './http';
import type { ApiResponse } from '../types/api';
import type { UserInfo } from '../stores/authStore';
import { storeRef } from '../stores/storeRef.js';

export const exchangeComeCode = async (code: string) => {
  const { data } = await http.get<ApiResponse<{ token: string; user: UserInfo }>>('/auth/come/callback', { params: { code } });
  if (storeRef) storeRef.authStore.setAuth(data.data.token, data.data.user);
  return data.data;
};

export const logout = () => storeRef?.authStore.logout();
