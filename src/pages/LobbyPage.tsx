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
  const lifePercent = Math.max(0, Math.min(100, (state.lifeAccount.lifeCount / 3) * 100));

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

      <div
        className="lobby-gradient-panel"
        style={{
          backgroundImage: `linear-gradient(130deg, rgba(0,100,255,0.88), rgba(0,83,214,0.9)), url("${currentScene?.coverUrl ?? ""}")`,
        }}
      >
        <div className="lobby-gradient-top">
          <div>
            <p className="hero-subtitle">{currentScene?.subtitle ?? "业务场景训练"}</p>
            <h2>{currentScene?.name}</h2>
          </div>
          <span className="lobby-scene-badge">LIVE</span>
        </div>
        <p className="lobby-user-meta">
          {state.currentUser?.name} ｜ {state.currentUser?.departmentName} ｜ {state.currentUser?.baseName}
        </p>
        <div className="lobby-energy-wrap">
          <div className="lobby-energy-head">
            <span>生命值</span>
            <strong>
              {state.lifeAccount.lifeCount}/3
            </strong>
          </div>
          <div className="lobby-energy-rail">
            <div className="lobby-energy-fill" style={{ width: `${lifePercent}%` }} />
          </div>
        </div>
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

      <div className="lobby-entry-grid">
        <button type="button" className="lobby-entry-card" onClick={() => navigate("/levels")}>
          <span>🎮</span>
          <div>
            <strong>关卡地图</strong>
            <p>继续推进训练</p>
          </div>
        </button>
        <button type="button" className="lobby-entry-card" onClick={() => navigate("/leaderboard")}>
          <span>🏆</span>
          <div>
            <strong>实时榜单</strong>
            <p>查看本期排名</p>
          </div>
        </button>
        <button type="button" className="lobby-entry-card" onClick={() => navigate("/learning")}>
          <span>📘</span>
          <div>
            <strong>学习中心</strong>
            <p>补齐薄弱知识点</p>
          </div>
        </button>
        <button type="button" className="lobby-entry-card" onClick={() => navigate("/store")}>
          <span>🛍️</span>
          <div>
            <strong>积分商城</strong>
            <p>兑换训练奖励</p>
          </div>
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
