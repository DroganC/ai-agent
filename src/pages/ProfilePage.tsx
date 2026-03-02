import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../components/PageShell";
import { useApp } from "../context/AppContext";
import { formatDateTime, formatDuration } from "../utils/helpers";

export const ProfilePage = () => {
  const { state, stats, actions } = useApp();
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const canTaskRevive =
    (state.reviveTasks.learningCompleted && !state.reviveTasks.claimedTaskIds.includes("learning")) ||
    (state.reviveTasks.reviewCompleted && !state.reviveTasks.claimedTaskIds.includes("review"));

  const latestAttempts = useMemo(
    () =>
      state.attemptOrder
        .slice(-5)
        .reverse()
        .map((id) => state.attemptsById[id])
        .filter(Boolean),
    [state.attemptOrder, state.attemptsById],
  );

  const reviveRemain = Math.max(state.reviveCounter.maxPerDay - state.reviveCounter.reviveCount, 0);

  const onRevive = async (type: "task" | "points") => {
    try {
      setBusy(true);
      setMsg("");
      await actions.revive(type);
      setMsg("复活成功，生命值已恢复。");
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "复活失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell title="我的" showTabBar>
      <div className="hero-card compact">
        <h2>{state.currentUser?.name ?? "-"}</h2>
        <p>
          {state.currentUser?.departmentName} · {state.currentUser?.baseName}
        </p>
        <p className="muted">
          职级 {state.currentUser?.jobLevel} ｜ 岗位 {state.currentUser?.jobTitle}
        </p>
      </div>

      <div className="grid-two">
        <div className="info-card">
          <span>累计通关</span>
          <strong>{stats.passLevelCount}</strong>
        </div>
        <div className="info-card">
          <span>总分</span>
          <strong>{stats.totalScore}</strong>
        </div>
        <div className="info-card">
          <span>最佳用时</span>
          <strong>
            {Number.isFinite(stats.bestDurationMs) && stats.bestDurationMs < Number.MAX_SAFE_INTEGER
              ? formatDuration(stats.bestDurationMs)
              : "--:--"}
          </strong>
        </div>
        <div className="info-card">
          <span>当前积分</span>
          <strong>{state.pointAccount.balance}</strong>
        </div>
      </div>

      <div className="section-card">
        <header className="section-header">
          <h3>生命与复活规则</h3>
          <span className="tag">今日剩余复活 {reviveRemain} 次</span>
        </header>
        <p className="muted">默认生命值 3，失败扣 1，主动退出不扣生命，生命为 0 时不能开始新挑战。</p>
        <p className="muted">任务复活：完成学习资料/复盘查看；积分复活：消耗 60 积分。</p>
        {msg ? <p className="feedback-text">{msg}</p> : null}
        <div className="grid-two">
          <button
            type="button"
            className="primary-btn"
            disabled={!canTaskRevive || busy}
            onClick={() => void onRevive("task")}
          >
            任务复活
          </button>
          <button
            type="button"
            className="ghost-btn"
            disabled={state.pointAccount.balance < 60 || busy}
            onClick={() => void onRevive("points")}
          >
            积分复活
          </button>
        </div>
      </div>

      <div className="section-card">
        <header className="section-header">
          <h3>最近战绩</h3>
        </header>
        <ul className="timeline">
          {latestAttempts.length === 0 ? <li>暂无挑战记录</li> : null}
          {latestAttempts.map((attempt) => {
            const level = state.levels.find((item) => item.id === attempt.levelId);
            return (
              <li key={attempt.id}>
                <span>{formatDateTime(attempt.startAt)}</span>
                <p>
                  {level?.name ?? "未知关卡"} · {attempt.status} · {attempt.score ?? 0} 分
                </p>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="section-card">
        <header className="section-header">
          <h3>积分明细（最近 6 条）</h3>
        </header>
        <ul className="timeline">
          {state.pointFlows.slice(0, 6).map((flow) => (
            <li key={flow.id}>
              <span>{formatDateTime(flow.createdAt)}</span>
              <p>
                {flow.reason} · {flow.change > 0 ? `+${flow.change}` : flow.change} · 余额 {flow.balanceAfter}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid-two">
        <button type="button" className="primary-btn" onClick={() => navigate("/poster")}>
          生成战绩海报
        </button>
        <button
          type="button"
          className="ghost-btn"
          onClick={() => {
            if (window.confirm("确认重置所有本地演示数据？")) {
              actions.resetDemoData();
              navigate("/login", { replace: true });
            }
          }}
        >
          重置演示数据
        </button>
      </div>
    </PageShell>
  );
};
