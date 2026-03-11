import type { Level } from '../../../types/api';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../icons';
import { Button } from '../../../components/common/Button';
import { Tag } from 'antd-mobile';

export type LevelListItemProps = {
  /** 关卡/游戏数据 */
  level: Level;
};

/**
 * 关卡列表单项：名称、难度、积分/用时、解锁状态、开始挑战按钮
 * 用于场景与关卡页的 sectionCardList 内
 */
export function LevelListItem({ level }: LevelListItemProps) {
  const navigate = useNavigate();

  return (
    <li className="sectionCardList__item" style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 'var(--font-body)', color: 'var(--color-text)' }}>
          {level.name}
        </div>
        <div className="subtle" style={{ marginTop: 'var(--space-1)' }}>
          难度 {level.difficulty} ★ · 预计 {level.estimated_seconds ?? '--'}s
        </div>
        <div
          style={{
            marginTop: 'var(--space-2)',
            fontSize: 'var(--font-caption)',
            color: 'var(--color-text-muted)',
            display: 'flex',
            gap: 'var(--space-2)',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <Icon name="star" size={14} weight="fill" /> {level.reward_points} 积分
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <Icon name="clock" size={14} weight="bold" /> {level.estimated_seconds ?? '--'}s
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <Icon name="pin" size={14} weight="bold" /> 场景
          </span>
        </div>
        <div style={{ marginTop: 'var(--space-2)' }}>
          <Button
            full
            variant={level.unlocked ? 'primary' : 'secondary'}
            onClick={() => level.unlocked && navigate(`/level/${level.id}/prepare`)}
            disabled={!level.unlocked}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              {level.unlocked ? '开始挑战' : '未解锁'}
              <Icon name="caretRight" size={14} weight="bold" />
            </span>
          </Button>
        </div>
      </div>
      <Tag color={level.unlocked ? 'success' : 'default'} fill="outline" style={{ flex: '0 0 auto' }}>
        {level.unlocked ? '已解锁' : '未解锁'}
      </Tag>
    </li>
  );
}
