import type { RootStore } from './rootStore.js';

/**
 * 可注入的根 Store 引用，用于在 services 等非 React 层访问 store，
 * 避免 singleton 与 rootStore 的循环依赖（rootStore → stores → services → singleton → rootStore）。
 * 由 main 在创建 rootStore 后注入。
 */
export let storeRef: RootStore | null = null;

export function setStoreRef(store: RootStore): void {
  storeRef = store;
}
