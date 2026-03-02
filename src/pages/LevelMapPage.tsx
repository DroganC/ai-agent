import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../components/PageShell";
import { useApp } from "../context/AppContext";
import { formatDuration } from "../utils/helpers";

const renderStars = (difficulty: number) => "★".repeat(difficulty) + "☆".repeat(5 - difficulty);

export const LevelMapPage = () => {
  const { state } = useApp();
  const navigate = useNavigate();

  const modules = useMemo(
    () =>
      state.modules
        .filter((item) => item.sceneId === state.selectedSceneId && item.status === 1)
        .sort((a, b) => a.orderNo - b.orderNo),
    [state.modules, state.selectedSceneId],
  );

  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(modules[0]?.id ?? null);

  useEffect(() => {
    setSelectedModuleId(modules[0]?.id ?? null);
  }, [modules]);

  const levels = useMemo(
    () =>
      state.levels
        .filter((item) => item.moduleId === selectedModuleId && item.status === 1)
        .sort((a, b) => a.id - b.id),
    [selectedModuleId, state.levels],
  );

  return (
    <PageShell title="关卡地图" showBack backTo="/lobby">
      <div className="scene-tip">场景：{state.scenes.find((item) => item.id === state.selectedSceneId)?.name}</div>

      <div className="scene-switcher">
        {modules.map((module) => (
          <button
            type="button"
            key={module.id}
            className={`chip-btn ${selectedModuleId === module.id ? "active" : ""}`}
            onClick={() => setSelectedModuleId(module.id)}
          >
            {module.name}
          </button>
        ))}
      </div>

      <div className="level-grid-two">
        {levels.map((level) => {
          const progress = state.progressByLevel[level.id];
          const locked = progress.unlockStatus === 0;
          const prevLevel = level.unlockPrevLevelId
            ? state.levels.find((item) => item.id === level.unlockPrevLevelId)
            : undefined;
          const statusLabel = locked ? "未解锁" : progress.passCount > 0 ? "已通关" : "可挑战";

          return (
            <article key={level.id} className="level-card level-map-card">
              <div className="level-header">
                <h3>{level.name}</h3>
                <span className={`status-pill ${locked ? "locked" : "open"}`}>{statusLabel}</span>
              </div>
              <p className="muted">难度：{renderStars(level.difficulty)}</p>
              <p className="muted">
                预计 {level.estimatedSeconds}s · 奖励 {level.rewardPoints} 积分
              </p>
              <p className="muted">知识点：{level.knowledgePoints.join("、")}</p>
              {progress.passCount > 0 ? (
                <p className="muted">
                  最佳成绩：{progress.bestScore} 分 / {formatDuration(progress.bestDurationMs ?? 0)}
                </p>
              ) : null}

              <button
                type="button"
                className={`primary-btn block-btn map-card-btn ${locked ? "disabled" : ""}`}
                onClick={() => {
                  if (locked) {
                    window.alert(`请先通关：${prevLevel?.name ?? "前置关卡"}`);
                    return;
                  }
                  navigate(`/levels/${level.id}/prepare`);
                }}
              >
                {locked ? "查看解锁条件" : progress.passCount > 0 ? "再来一次" : "进入挑战"}
              </button>
            </article>
          );
        })}
      </div>
    </PageShell>
  );
};
