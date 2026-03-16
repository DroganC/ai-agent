import type { ReactNode } from 'react';
import { Icon } from '../../icons';

/** 二级页通用头部：返回按钮 + 大标题 + 描述（与 level prepare 等页样式一致） */
export type PageHeaderProps = {
  /** 主标题 */
  title: string;
  /** 描述文案，可选 */
  description?: ReactNode;
  /** 点击返回时的回调，不传则不显示返回按钮 */
  onBack?: () => void;
  /** 右侧区域（如操作按钮），可选 */
  right?: ReactNode;
};

/**
 * 二级页通用头部组件
 * 使用与 level prepare 相同的 game-intro__head 结构，保证所有二级页头部样式一致：
 * 左侧返回 icon，中间大标题 + 描述，可选右侧操作区
 */
export function PageHeader({ title, description, onBack, right }: PageHeaderProps) {
  return (
    <div className="game-intro__head">
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
      <div className="game-intro__title-wrap">
        <h1 className="game-intro__title">{title}</h1>
        {description != null && (
          <div className="subtle" style={{ marginTop: 'var(--space-1)' }}>
            {description}
          </div>
        )}
      </div>
      {right != null ? <div className="game-intro__head-right">{right}</div> : null}
    </div>
  );
}
