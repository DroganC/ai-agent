/**
 * 运行时环境变量（Vite 会注入 VITE_*）
 * 生产构建也可通过环境变量开启 mock，便于演示或联调前自测。
 */
export const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false';
