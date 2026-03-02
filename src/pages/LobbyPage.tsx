import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../components/PageShell";
import { useApp } from "../context/AppContext";
import { formatDuration } from "../utils/helpers";

export const LobbyPage = () => {
  const { state, stats, actions } = useApp();
  const navigate = useNavigate();

  const currentScene = useMemo(
    () => state.scenes.find((item) => item.id === state.selectedSceneId),
    [state.scenes, state.selectedSceneId],
  );

  const recentAttempt = stats.lastAttemptId ? state.attemptsById[stats.lastAttemptId] : undefined;
  const recentLevel =
    recentAttempt && state.levels.find((item) => item.id === recentAttempt.levelId);

  const bestDurationLabel =
    Number.isFinite(stats.bestDurationMs) && stats.bestDurationMs < Number.MAX_SAFE_INTEGER
      ? formatDuration(stats.bestDurationMs)
      : "--:--";

  const onMainAction = () => {
    if (state.lifeAccount.lifeCount <= 0) {
      navigate("/profile");
      return;
    }
    if (recentAttempt?.status === "in_progress" && recentLevel) {
      navigate(`/levels/${recentLevel.id}/play/${recentAttempt.id}`);
      return;
    }
    navigate("/levels");
  };

  return (
    <PageShell
      title="游戏大厅"
      showTabBar
      rightSlot={
        <button type="button" className="mini-btn" onClick={() => actions.logout()}>
          退出
        </button>
      }
    >
      <div className="scene-switcher">
        {state.scenes.map((scene) => (
          <button
            className={`chip-btn ${scene.id === state.selectedSceneId ? "active" : ""}`}
            type="button"
            key={scene.id}
            onClick={() => actions.switchScene(scene.id)}
          >
            {scene.name}
          </button>
        ))}
      </div>

      <div className="hero-card">
        <p className="hero-subtitle">{currentScene?.subtitle ?? "业务场景训练"}</p>
        <h2>{currentScene?.name}</h2>
        <p>
          {state.currentUser?.name} ｜ {state.currentUser?.departmentName} ｜ {state.currentUser?.baseName}
        </p>
      </div>

      <div className="grid-two">
        <button type="button" className="info-card" onClick={() => navigate("/profile")}>
          <span>总分</span>
          <strong>{stats.totalScore}</strong>
        </button>
        <button type="button" className="info-card" onClick={() => navigate("/profile")}>
          <span>最佳用时</span>
          <strong>{bestDurationLabel}</strong>
        </button>
        <button type="button" className="info-card" onClick={() => navigate("/profile")}>
          <span>生命值</span>
          <strong>{state.lifeAccount.lifeCount}</strong>
        </button>
        <button type="button" className="info-card" onClick={() => navigate("/profile")}>
          <span>积分</span>
          <strong>{state.pointAccount.balance}</strong>
        </button>
      </div>

      <button
        type="button"
        className="primary-btn block-btn"
        onClick={onMainAction}
        disabled={false}
      >
        {state.lifeAccount.lifeCount <= 0
          ? "生命值不足，去复活"
          : recentAttempt?.status === "in_progress"
            ? "继续闯关"
            : "开始闯关"}
      </button>

      {recentLevel ? (
        <div className="section-card">
          <header className="section-header">
            <h3>最近挑战</h3>
            <span className="tag">{recentAttempt?.status}</span>
          </header>
          <p className="muted">{recentLevel.name}</p>
          <p className="muted">可前往“关卡地图”继续挑战或重玩。</p>
        </div>
      ) : (
        <div className="section-card">
          <header className="section-header">
            <h3>新手引导</h3>
          </header>
          <p className="muted">优先完成「消防基础操作」模块，快速熟悉操作规则与扣分点。</p>
        </div>
      )}
    </PageShell>
  );
};
