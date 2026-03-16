/**
 * 部署/运行配置，收敛所有 Vite 环境变量（VITE_*、BASE_URL）。
 * 业务代码统一从 DEPLOY_CONFIG 读取，便于替换来源（如运行时注入、构建时注入）。
 */

const rawBase = import.meta.env.BASE_URL ?? '/';
const basename = rawBase === '/' ? '' : rawBase.replace(/\/$/, '');

export interface DeployConfig {
  /** 是否使用 Mock 数据（对应 VITE_USE_MOCK，默认 true） */
  USE_MOCK: boolean;
  /** 接口基础路径（对应 VITE_API_BASE，默认 /api/v1） */
  API_BASE: string;
  /** 部署基准路径，带尾部斜杠（如 /come/game/），由 Vite base 注入 BASE_URL */
  BASE: string;
  /** 供 React Router 使用的 basename，无尾部斜杠（空串表示根路径） */
  BASENAME: string;
}

export const DEPLOY_CONFIG: DeployConfig = {
  USE_MOCK: (import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false',
  API_BASE: import.meta.env.VITE_API_BASE || '/api/v1',
  BASE: rawBase,
  BASENAME: basename,
};

if (typeof window !== 'undefined') {
  Object.defineProperties(window, {
    DEPLOY_CONFIG: {
      value: DEPLOY_CONFIG,
      writable: false,
      configurable: false,
    },
  });
}

declare global {
  interface Window {
    DEPLOY_CONFIG: DeployConfig;
  }
}
