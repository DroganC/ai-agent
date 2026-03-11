import type { LevelModule } from '../../../types/api';
import { TagPill } from '../../../components/common/TagPill';

export type ModuleFilterRowProps = {
  /** 模块列表 */
  modules: LevelModule[];
  /** 当前选中的模块 id */
  activeModuleId: number | null;
  /** 点击某一模块时回调 */
  onSelect: (moduleId: number) => void;
};

/**
 * 按模块筛选：横向滚动的模块 Tag 列表，单选
 */
export function ModuleFilterRow({ modules, activeModuleId, onSelect }: ModuleFilterRowProps) {
  return (
    <div>
      <div className="sectionTitle">按模块筛选</div>
      <div className="sectionCard">
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            overflowX: 'auto',
            paddingBottom: 'var(--space-1)',
          }}
        >
          {modules.map((m) => (
            <span
              key={m.id}
              onClick={() => onSelect(m.id)}
              style={{ flex: '0 0 auto', cursor: 'pointer' }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelect(m.id)}
              aria-pressed={activeModuleId === m.id}
            >
              <TagPill active={activeModuleId === m.id}>{m.name}</TagPill>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
