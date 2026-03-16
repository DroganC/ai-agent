/**
 * 请求 URL 前缀：在 path 前加上服务名，如 /ehs-backend/v1/scenes。
 * @param path - 路径，可带或不带前导 /，会统一处理
 */
export const getApiPrefix = (path: string): string => {
  const p = path.startsWith('/') ? path.slice(1) : path;
  return `/ehs-backend/v1/${p}`;
};