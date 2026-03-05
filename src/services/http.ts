import axios, { AxiosError, AxiosHeaders } from 'axios';
import { authStore } from '../store/auth';
import { getAxiosApiError } from '../utils/error';

const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1';

export const http = axios.create({ baseURL: API_BASE });

http.interceptors.request.use((config) => {
  const token = authStore.token;
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
  if (token) authStore.token = token;
};
