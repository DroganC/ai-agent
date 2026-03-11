/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 是否启用 Mock 数据（'true' | 'false'），默认 'true'；生产构建也可设为 'true' 用于演示或自测 */
  readonly VITE_USE_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
