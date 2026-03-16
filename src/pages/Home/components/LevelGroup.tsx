import { LevelCard } from './LevelCard';
import type { Level, LevelModule } from '../../../types/api';

export type LevelGroupProps = {
  /** 模块信息（用于标题） */
  module: LevelModule;
  /** 该模块下的游戏列表，已按 id 排序 */
  levels: Level[];
  /** 点击某游戏时的回调 */
  onLevelClick: (levelId: number) => void;
};

/**
 * 首页按模块分组的游戏列表
 * 展示模块名称、游戏数量，以及该组内的游戏卡片列表
 */
export function LevelGroup({ module, levels, onLevelClick }: LevelGroupProps) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin: '0.18rem 0.04rem',
        }}
      >
        <div style={{ fontSize: '0.34rem', fontWeight: 800 }}>{module.name}</div>
        <div style={{ fontSize: '0.26rem', color: '#6b7280' }}>{levels.length} 个游戏</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {levels.map((level) => (
          <LevelCard key={level.id} level={level} onClick={onLevelClick} />
        ))}
      </div>
    </div>
  );
}
