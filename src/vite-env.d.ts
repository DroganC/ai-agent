/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 是否启用 Mock 数据（'true' | 'false'），默认 'true'；生产构建也可设为 'true' 用于演示或自测 */
  readonly VITE_USE_MOCK?: string;
  /**
   * 部署基准路径（如 '/come/game/'），构建时通过 .env 的 VITE_BASE 设置；
   * 运行时可通过 import.meta.env.BASE_URL 获取（由 Vite 根据 base 注入）。
   */
  readonly VITE_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
