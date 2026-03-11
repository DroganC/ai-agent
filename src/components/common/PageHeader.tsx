import type { ReactNode } from 'react';
import { Icon } from '../../icons';

/** 页面头部 Props：标题、副标题、返回、右侧操作区 */
export type PageHeaderProps = {
  /** 主标题 */
  title: string;
  /** 副标题，可选 */
  subtitle?: string;
  /** 点击返回时的回调，不传则不显示返回按钮 */
  onBack?: () => void;
  /** 右侧区域（如刷新、操作按钮），可选 */
  right?: ReactNode;
  /** 是否使用大号标题（与首页一致的 font-h1），默认 true */
  largeTitle?: boolean;
};

/**
 * 二级页通用顶部栏：返回按钮 + 标题（+ 副标题）+ 右侧操作区
 * 用于与首页一致的大标题样式，并统一返回按钮交互
 */
export function PageHeader({ title, subtitle, onBack, right, largeTitle = true }: PageHeaderProps) {
  return (
    <div className="row">
      {onBack != null ? (
        <button
          type="button"
          className="actionPill"
          onClick={onBack}
          style={{ padding: 0, width: '0.84rem', height: '0.84rem', justifyContent: 'center' }}
          aria-label="返回"
        >
          <span style={{ display: 'inline-flex', transform: 'rotate(180deg)' }}>
            <Icon name="caretRight" size={18} weight="bold" />
          </span>
        </button>
      ) : null}
      <div style={{ flex: 1 }}>
        <div
          className="title"
          style={largeTitle ? { fontSize: 'var(--font-h1)' } : undefined}
        >
          {title}
        </div>
        {subtitle != null && (
          <div className="subtle" style={{ marginTop: 'var(--space-1)' }}>
            {subtitle}
          </div>
        )}
      </div>
      {right != null ? right : null}
    </div>
  );
}
