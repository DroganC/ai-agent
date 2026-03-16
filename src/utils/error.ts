/**
 * 统一错误处理：从 unknown/Error/接口错误中提取可展示文案，以及将 axios 错误转为带 code/message 的对象。
 */
import type { AxiosError } from 'axios';

type ErrorWithMessage = {
  message?: string;
  code?: string;
};

type ApiErrorData = {
  error?: {
    code?: string;
    message?: string;
  };
};

/** 从任意错误中提取展示文案，失败时返回 fallback */
export const getErrorMessage = (error: unknown, fallback = '服务异常，请稍后重试'): string => {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'object' && error !== null) {
    const maybe = error as ErrorWithMessage;
    if (maybe.message) return maybe.message;
  }
  return fallback;
};

/** 将 axios 错误转为带 code、message 的对象，供拦截器统一抛出 */
export const getAxiosApiError = (error: AxiosError<unknown>): ErrorWithMessage => {
  const payload = error.response?.data as ApiErrorData | undefined;
  const code = payload?.error?.code;
  const message = payload?.error?.message ?? '服务异常，请稍后重试';
  return { ...error, code, message };
};
