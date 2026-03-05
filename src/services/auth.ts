import { http } from './http';
import type { ApiResponse } from '../types/api';
import { authStore, UserInfo } from '../store/auth';

export const exchangeComeCode = async (code: string) => {
  const { data } = await http.get<ApiResponse<{ token: string; user: UserInfo }>>('/auth/come/callback', { params: { code } });
  authStore.setAuth(data.data.token, data.data.user);
  return data.data;
};

export const logout = () => authStore.logout();
