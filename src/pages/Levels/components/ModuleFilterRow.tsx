import type { LevelModule } from '../../../types/api';

export type ModuleFilterRowProps = {
  modules: LevelModule[];
  activeModuleId: number | null;
  onSelect: (moduleId: number) => void;
};

/**
 * 按模块筛选：横向滚动的柔和胶囊，单选
 */
export function ModuleFilterRow({ modules, activeModuleId, onSelect }: ModuleFilterRowProps) {
  return (
    <div className="filter-row">
      <div className="filter-row__label">
        <span>模块</span>
      </div>
      <div className="filter-row__scroll">
        {modules.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`filter-pill ${activeModuleId === m.id ? 'filter-pill--active' : ''}`}
            onClick={() => onSelect(m.id)}
            aria-pressed={activeModuleId === m.id}
          >
            {m.name}
          </button>
        ))}
      </div>
    </div>
  );
}
