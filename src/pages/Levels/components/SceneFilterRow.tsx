import type { Scene } from '../../../types/api';
import { TagPill } from '../../../components/common/TagPill';

export type SceneFilterRowProps = {
  /** 场景列表 */
  scenes: Scene[];
  /** 当前选中的场景 code */
  activeSceneCode: string;
  /** 点击某一场景时回调 */
  onSelect: (sceneCode: string) => void;
};

/**
 * 按场景筛选：横向滚动的场景 Tag 列表，单选
 */
export function SceneFilterRow({ scenes, activeSceneCode, onSelect }: SceneFilterRowProps) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-2)',
        }}
      >
        <div className="sectionTitle" style={{ marginBottom: 0 }}>
          按场景筛选
        </div>
        <span className="subtle">共 {scenes.length} 个</span>
      </div>
      <div className="sectionCard">
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            overflowX: 'auto',
            paddingBottom: 'var(--space-1)',
          }}
        >
          {scenes.map((s) => (
            <span
              key={s.id}
              onClick={() => onSelect(s.code)}
              style={{ flex: '0 0 auto', cursor: 'pointer' }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelect(s.code)}
              aria-pressed={activeSceneCode === s.code}
            >
              <TagPill active={activeSceneCode === s.code}>{s.name}</TagPill>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
