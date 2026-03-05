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

export const getErrorMessage = (error: unknown, fallback = '服务异常，请稍后重试'): string => {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'object' && error !== null) {
    const maybe = error as ErrorWithMessage;
    if (maybe.message) return maybe.message;
  }
  return fallback;
};

export const getAxiosApiError = (error: AxiosError<unknown>): ErrorWithMessage => {
  const payload = error.response?.data as ApiErrorData | undefined;
  const code = payload?.error?.code;
  const message = payload?.error?.message ?? '服务异常，请稍后重试';
  return { ...error, code, message };
};
