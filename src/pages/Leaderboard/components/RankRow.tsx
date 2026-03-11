import { Icon } from '../../../icons';
import { ProgressMini } from '../../../components/common/ProgressMini';
import type { LeaderboardItem } from '../../../types/api';

export type RankRowProps = {
  /** 排行榜单条数据 */
  item: LeaderboardItem;
};

/**
 * 排行榜单行（用于 .sectionCardList__item 内）：排名、昵称、部门、得分、用时、进度条
 */
export function RankRow({ item }: RankRowProps) {
  const durationSec = (item.best_duration_ms / 1000).toFixed(0);
  const progressPercent = Math.min(100, (item.total_score / 2000) * 100);

  const left = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        flex: 1,
        minWidth: 0,
      }}
    >
      <span
        style={{
          width: '0.72rem',
          height: '0.72rem',
          borderRadius: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'var(--font-caption)',
          fontWeight: item.rank <= 3 ? 900 : 700,
          background: item.rank <= 3 ? 'rgba(0,100,255,0.12)' : 'rgba(107,114,128,0.10)',
          color: item.rank <= 3 ? 'var(--color-primary)' : 'var(--color-text-muted)',
          flex: '0 0 auto',
        }}
      >
        {item.rank}
      </span>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontWeight: item.is_me ? 900 : 700,
            color: item.is_me ? 'var(--color-primary)' : 'var(--color-text)',
            fontSize: 'var(--font-body)',
          }}
        >
          {item.name}
        </div>
        <div className="subtle" style={{ marginTop: 'var(--space-1)' }}>
          {item.department_name ?? '未分配部门'}
        </div>
      </div>
    </div>
  );

  const right = (
    <div
      style={{
        width: '2.4rem',
        flex: '0 0 auto',
        textAlign: 'right',
        fontSize: 'var(--font-caption)',
        color: 'var(--color-text-muted)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          justifyContent: 'flex-end',
          color: 'var(--color-text)',
        }}
      >
        <Icon name="star" size={14} weight="fill" /> {item.total_score}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          justifyContent: 'flex-end',
        }}
      >
        <Icon name="clock" size={14} weight="bold" /> {durationSec} 秒
      </div>
      <ProgressMini percent={progressPercent} />
    </div>
  );

  return (
    <>
      {left}
      {right}
    </>
  );
}
