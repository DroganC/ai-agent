/**
 * 构建阶段配置：区分 production / 非 production，以及生产环境 base 占位符。
 * - 供 vite.config.ts 使用；
 * - 生产服务器部署时可用 shell 脚本将 BASE_PATH_PLACEHOLDER 替换为实际路径（如 /come/game）。
 */

/** 是否为生产构建（npm run build 时为 true） */
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * 生产构建时 base 使用的固定占位符。
 * 构建产物（index.html、*.js）中会包含此字符串，部署时由服务器 shell 脚本替换为实际路径。
 *
 * 用法示例（与 scripts/replace-base-path.sh 一致）：
 *   # 单次替换
 *   sed -i.bak "s|__BASE_PATH__|/come/game|g" dist/index.html dist/assets/*.js
 *   # 或使用脚本
 *   ./scripts/replace-base-path.sh /come/game
 */
export const BASE_PATH_PLACEHOLDER = '__BASE_PATH__';
