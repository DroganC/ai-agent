import type { LeaderboardScope } from '../../../stores/leaderboardStore';

export type ScopeTabsProps = {
  /** 当前选中的范围 */
  scope: LeaderboardScope;
  /** 切换范围回调 */
  onScopeChange: (scope: LeaderboardScope) => void;
  /** 当前用户部门名，用于本部门筛选及禁用态提示 */
  myDepartmentName: string | undefined;
};

/**
 * 排行榜范围切换：全部 / 本部门，以及当前范围说明文案
 */
export function ScopeTabs({ scope, onScopeChange, myDepartmentName }: ScopeTabsProps) {
  return (
    <div className="row" style={{ justifyContent: 'flex-start', gap: 'var(--space-2)' }}>
      <div className="chipGroup" role="tablist" aria-label="排行榜范围">
        <button
          type="button"
          className={`chip ${scope === 'all' ? 'chipActive' : ''}`}
          onClick={() => onScopeChange('all')}
          role="tab"
          aria-selected={scope === 'all'}
        >
          全部
        </button>
        <button
          type="button"
          className={`chip ${scope === 'dept' ? 'chipActive' : ''}`}
          onClick={() => onScopeChange('dept')}
          disabled={!myDepartmentName}
          aria-disabled={!myDepartmentName}
          style={!myDepartmentName ? { opacity: 0.5 } : undefined}
          role="tab"
          aria-selected={scope === 'dept'}
        >
          本部门
        </button>
      </div>
      <div className="subtle">
        {scope === 'dept' ? (myDepartmentName ?? '未分配部门') : '全员榜单'}
      </div>
    </div>
  );
}
