import { Card } from 'antd-mobile';
import { Icon } from '../../../icons';
import type { Level } from '../../../types/api';

export type LevelCardProps = {
  /** 关卡数据 */
  level: Level;
  /** 点击卡片时回调，参数为关卡 id */
  onClick: (levelId: number) => void;
};

/**
 * 首页单个关卡/游戏入口卡片
 * 展示名称、积分、预计时长、解锁状态，点击跳转游戏首页
 */
export function LevelCard({ level, onClick }: LevelCardProps) {
  return (
    <Card key={level.id} onClick={() => onClick(level.id)} style={{ borderRadius: 'var(--radius-card)', margin: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.24rem', padding: '0.16rem 0.04rem' }}>
        <div
          style={{
            width: '0.92rem',
            height: '0.92rem',
            borderRadius: 'var(--radius-card)',
            background: 'linear-gradient(135deg, rgba(0,100,255,0.18), rgba(255,107,107,0.12))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: '0 0 auto',
          }}
        >
          <Icon name="checklist" size={22} weight="bold" />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: '0.34rem',
              fontWeight: 800,
              color: '#111827',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {level.name}
          </div>
          <div
            style={{
              fontSize: '0.26rem',
              color: '#6b7280',
              marginTop: '0.06rem',
              display: 'flex',
              gap: '0.22rem',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="star" size={14} weight="fill" /> {level.reward_points} 积分
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="clock" size={14} weight="bold" /> 约 {level.estimated_seconds ?? '--'} 秒
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name={level.unlocked ? 'success' : 'error'} size={14} weight={level.unlocked ? 'fill' : 'bold'} />{' '}
              {level.unlocked ? '可开始' : '未解锁'}
            </span>
          </div>
        </div>
        <Icon name="caretRight" size={18} weight="bold" />
      </div>
    </Card>
  );
}
