import { LevelCard } from './LevelCard';
import type { Level, LevelModule } from '../../../types/api';

export type LevelGroupProps = {
  /** 模块信息（用于标题） */
  module: LevelModule;
  /** 该模块下的关卡列表，已按 id 排序 */
  levels: Level[];
  /** 点击某关卡时的回调 */
  onLevelClick: (levelId: number) => void;
};

/**
 * 首页按模块分组的关卡列表
 * 展示模块名称、关卡数量，以及该组内的关卡卡片列表；仅用 gap 控制间距，卡片无 margin
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
        <div style={{ fontSize: '0.26rem', color: '#6b7280' }}>{levels.length} 个</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {levels.map((level) => (
          <LevelCard key={level.id} level={level} onClick={onLevelClick} />
        ))}
      </div>
    </div>
  );
}
