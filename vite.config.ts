import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * 环境变量（可选，通过 .env 或 .env.production 设置）：
 * - VITE_USE_MOCK: 'true' | 'false'，是否使用 src/mocks 下的 Mock 数据，默认 'true'。
 *   生产构建也可设为 VITE_USE_MOCK=true 以便演示或联调前自测。
 */
export default defineConfig({
  plugins: [react()],
  css: {
    devSourcemap: true,
  },
});
