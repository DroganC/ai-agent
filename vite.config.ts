import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { BASE_PATH_PLACEHOLDER, IS_PRODUCTION } from './build-config';

/**
 * 环境变量（可选，通过 .env 或 .env.production 设置）：
 * - VITE_USE_MOCK: 'true' | 'false'，是否使用 src/mocks 下的 Mock 数据，默认 'true'。
 * - VITE_BASE: 应用部署的基准路径，如 '/come/game/'。
 *   - 开发 / 非 production：不设则默认为 '/'。
 *   - production 构建且未设 VITE_BASE：使用 build-config 中的 BASE_PATH_PLACEHOLDER，供部署时 shell 脚本替换。
 */
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base:
    IS_PRODUCTION
      ? (process.env.VITE_BASE ?? BASE_PATH_PLACEHOLDER)
      : (process.env.VITE_BASE ?? '/'),
  css: {
    devSourcemap: true,
  },
}));
