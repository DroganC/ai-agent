/**
 * 运行时环境变量，统一从 DEPLOY_CONFIG 读取（来源见 src/utils/configure.tsx）。
 * 生产构建也可通过 VITE_USE_MOCK=true 开启 mock，便于演示或联调前自测。
 */
import { DEPLOY_CONFIG } from '../utils/configure';

export const USE_MOCK = DEPLOY_CONFIG.USE_MOCK;
