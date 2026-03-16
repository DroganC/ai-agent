import axios, { AxiosError, AxiosHeaders } from 'axios';
import { runInAction } from 'mobx';
import { storeRef } from '../stores/storeRef.js';
import { getAxiosApiError } from '../utils/error';
import { DEPLOY_CONFIG } from '../utils/configure';

export const http = axios.create({ baseURL: DEPLOY_CONFIG.API_BASE });

http.interceptors.request.use((config) => {
  const token = storeRef?.authStore.token;
  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

http.interceptors.response.use(
  (resp) => resp,
  (error: AxiosError) => {
    return Promise.reject(getAxiosApiError(error));
  }
);

export const setAuthToken = (token: string | null) => {
  if (token && storeRef) runInAction(() => { storeRef!.authStore.token = token; });
};
