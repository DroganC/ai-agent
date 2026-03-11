import type { Scene, LevelModule } from '../../../types/api';

export type SceneModuleFilterProps = {
  scenes: Scene[];
  modules: LevelModule[];
  activeSceneCode: string;
  activeModuleId: number | null;
  onSceneSelect: (sceneCode: string) => void;
  onModuleSelect: (moduleId: number) => void;
};

/**
 * 场景 → 模块 关联筛选：先选场景，下方展示该场景下的模块
 * 一个场景下可有多个模块，二者为父子关系
 */
export function SceneModuleFilter({
  scenes,
  modules,
  activeSceneCode,
  activeModuleId,
  onSceneSelect,
  onModuleSelect,
}: SceneModuleFilterProps) {
  const activeScene = scenes.find((s) => s.code === activeSceneCode);
  const activeSceneName = activeScene?.name ?? '当前场景';

  return (
    <div className="filter-cascade">
      <div className="filter-cascade__section">
        <div className="filter-cascade__label">场景</div>
        <div className="filter-row__scroll">
          {scenes.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`filter-pill ${activeSceneCode === s.code ? 'filter-pill--active' : ''}`}
              onClick={() => onSceneSelect(s.code)}
              aria-pressed={activeSceneCode === s.code}
            >
              {s.name}
            </button>
          ))}
          {scenes.length === 0 && (
            <span className="subtle" style={{ padding: 'var(--space-2) 0' }}>暂无场景</span>
          )}
        </div>
      </div>
      <div className="filter-cascade__section">
        <div className="filter-cascade__label">
          模块
          <span className="filter-cascade__sublabel">（{activeSceneName}）</span>
        </div>
        <div className="filter-row__scroll">
          {modules.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`filter-pill ${activeModuleId === m.id ? 'filter-pill--active' : ''}`}
              onClick={() => onModuleSelect(m.id)}
              aria-pressed={activeModuleId === m.id}
            >
              {m.name}
            </button>
          ))}
          {modules.length === 0 && (
            <span className="subtle" style={{ padding: 'var(--space-2) 0' }}>该场景下暂无模块</span>
          )}
        </div>
      </div>
    </div>
  );
}
