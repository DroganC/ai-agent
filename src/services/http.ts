/**
 * 封装项目内所有 HTTP 请求的 axios 实例与拦截器。
 * - 请求：自动附加 Authorization Bearer Token（从 authStore 读取）
 * - 响应：统一将 axios 错误转换为业务 ApiError，便于上层处理
 * - 调用方式：统一使用对象形式 http.get({ url, params?, headers?, ... }) / http.post({ url, data?, headers?, ... }) 等
 */
import axios, { AxiosError, AxiosHeaders, type AxiosInstance, type AxiosResponse } from 'axios';
import { runInAction } from 'mobx';
import { storeRef } from '../stores/storeRef.js';
import { getAxiosApiError } from '../utils/error';
import { DEPLOY_CONFIG } from '../utils/configure';

/** 请求配置（对象形式），与 axios 的 params/headers 等一致 */
export interface HttpRequestConfig {
  url: string;
  params?: Record<string, unknown>;
  data?: Record<string, unknown>;
  headers?: Record<string, string>;
}

const axiosInstance: AxiosInstance = axios.create({ baseURL: DEPLOY_CONFIG.API_BASE });

/** 请求拦截：若已登录则为所有请求头附加 Bearer Token */
axiosInstance.interceptors.request.use((config) => {
  const token = storeRef?.authStore.token;
  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

/** 响应拦截：将 axios 错误统一转换为业务 ApiError 后抛出 */
axiosInstance.interceptors.response.use(
  (resp) => resp,
  (error: AxiosError) => {
    return Promise.reject(getAxiosApiError(error));
  }
);

/**
 * 对象形式的 HTTP 客户端：http.get({ url, params?, headers? }) / http.post({ url, data?, headers? }) 等。
 * 返回与 axios 相同的响应结构，可直接解构 const { data } = await http.get(...)
 */
export const http = {
  get: <T = unknown>(config: HttpRequestConfig): Promise<AxiosResponse<T>> => {
    const { url, params, headers, ...rest } = config;
    return axiosInstance.get<T>(url, { params, headers, ...rest });
  },
  post: <T = unknown>(config: HttpRequestConfig): Promise<AxiosResponse<T>> => {
    const { url, data, headers, ...rest } = config;
    return axiosInstance.post<T>(url, data ?? {}, { headers, ...rest });
  },
  patch: <T = unknown>(config: HttpRequestConfig): Promise<AxiosResponse<T>> => {
    const { url, data, headers, ...rest } = config;
    return axiosInstance.patch<T>(url, data ?? {}, { headers, ...rest });
  },
};

/**
 * 同步 authStore 中的 token（用于登录回调等场景写入 token）。
 * @param token - 新的 token，传 null 时不修改 store
 */
export const setAuthToken = (token: string | null) => {
  if (token && storeRef) runInAction(() => { storeRef!.authStore.token = token; });
};
