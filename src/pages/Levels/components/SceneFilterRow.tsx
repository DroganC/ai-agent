import type { Scene } from '../../../types/api';
import { TagPill } from '../../../components/common/TagPill';

export type SceneFilterRowProps = {
  /** 场景列表 */
  scenes: Scene[];
  /** 当前选中的场景 id，null 表示「全部」 */
  activeSceneId: number | null;
  /** 点击「全部」时回调 */
  onSelectAll: () => void;
  /** 点击某一场景时回调 */
  onSelectScene: (id: number) => void;
  /** 为 true 时不包一层 sectionCard，由父级提供容器（用于与搜索框合并为一块） */
  noCard?: boolean;
};

/**
 * 游戏列表 - 场景分类筛选：横向滚动的场景 Tag，含「全部」
 */
export function SceneFilterRow({
  scenes,
  activeSceneId,
  onSelectAll,
  onSelectScene,
  noCard = false,
}: SceneFilterRowProps) {
  const content = (
    <div
      className={noCard ? 'levels-scene-filter__row' : undefined}
      style={{
        display: 'flex',
        gap: 'var(--space-2)',
        overflowX: 'auto',
        paddingBottom: noCard ? 0 : 'var(--space-1)',
      }}
    >
        <span
          onClick={onSelectAll}
          style={{ flex: '0 0 auto', cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onSelectAll()}
          aria-pressed={activeSceneId === null}
        >
          <TagPill active={activeSceneId === null}>全部</TagPill>
        </span>
        {scenes.map((s) => (
          <span
            key={s.id}
            onClick={() => onSelectScene(s.id)}
            style={{ flex: '0 0 auto', cursor: 'pointer' }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectScene(s.id)}
            aria-pressed={activeSceneId === s.id}
          >
            <TagPill active={activeSceneId === s.id}>{s.name}</TagPill>
          </span>
        ))}
    </div>
  );
  if (noCard) return content;
  return <div className="sectionCard levels-scene-filter">{content}</div>;
}
