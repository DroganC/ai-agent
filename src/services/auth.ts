/**
 * 认证相关接口：登录（通过 Come 回调 code 换 token）、登出。
 * 登录成功后会同步更新 authStore 的 token 与用户信息。
 */
import { http } from './http';
import { getApiPrefix } from './prefix';
import type { ApiResponse } from '../types/api';
import type { UserInfo } from '../stores/authStore';
import { storeRef } from '../stores/storeRef.js';
import { USE_MOCK } from '../config/env';
import { mockAuthExchangeCode } from '../mocks/api';

/**
 * 使用 Come 登录回调返回的 code 换取 token 与用户信息，并写入 authStore。
 * @param code - 登录回调 URL 中的授权码
 * @returns 含 token 与 user 的对象；同时会调用 authStore.setAuth
 */
export const exchangeComeCode = async (code: string) => {
  if (USE_MOCK) {
    const data = await mockAuthExchangeCode(code);
    if (storeRef) storeRef.authStore.setAuth(data.token, data.user);
    return data;
  }
  const { data } = await http.get<ApiResponse<{ token: string; user: UserInfo }>>({ url: getApiPrefix('auth/come/callback'), params: { code } });
  if (storeRef) storeRef.authStore.setAuth(data.data.token, data.data.user);
  return data.data;
};

/** 登出：清空 authStore 中的 token 与用户信息 */
export const logout = () => storeRef?.authStore.logout();
