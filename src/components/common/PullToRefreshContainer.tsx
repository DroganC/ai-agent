import type { ReactNode } from 'react';
import { PullToRefresh } from 'antd-mobile';

export type PullToRefreshContainerProps = {
  /** 下拉触发的刷新方法，需返回 Promise */
  onRefresh: () => Promise<void>;
  /** 子内容 */
  children: ReactNode;
  /** 是否禁用下拉刷新（如 loading/error 时可选禁用） */
  disabled?: boolean;
};

/**
 * 下拉刷新容器
 * 包裹页面内容，支持下拉刷新，统一文案
 */
export function PullToRefreshContainer({ onRefresh, children, disabled = false }: PullToRefreshContainerProps) {
  return (
    <PullToRefresh
      onRefresh={onRefresh}
      disabled={disabled}
      pullingText="下拉刷新"
      canReleaseText="释放立即刷新"
      refreshingText="加载中…"
      completeText="刷新完成"
      completeDelay={300}
    >
      {children}
    </PullToRefresh>
  );
}
