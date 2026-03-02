import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageShell } from "../components/PageShell";
import { useApp } from "../context/AppContext";
import { formatDateTime, formatDuration } from "../utils/helpers";

export const LevelResultPage = () => {
  const { attemptId } = useParams();
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const reviewMarked = useRef(false);
  const [reviveBusy, setReviveBusy] = useState(false);
  const [reviveMsg, setReviveMsg] = useState("");

  const attempt = attemptId ? state.attemptsById[attemptId] : undefined;
  const level = attempt ? state.levels.find((item) => item.id === attempt.levelId) : undefined;
  const progress = level ? state.progressByLevel[level.id] : undefined;

  useEffect(() => {
    if (!attempt || reviewMarked.current) return;
    actions.markReviewCompleted(attempt.id);
    reviewMarked.current = true;
  }, [actions, attempt]);

  const reward = useMemo(() => {
    if (!attempt) return 0;
    const flow = state.pointFlows.find((item) => item.refId === attempt.id && item.change > 0);
    return flow?.change ?? 0;
  }, [attempt, state.pointFlows]);

  if (!attempt || !level || !progress) {
    return (
      <PageShell title="挑战结算" showBack>
        <div className="state-block error">未找到结算记录</div>
      </PageShell>
    );
  }

  const isPass = attempt.status === "passed";
  const canTaskRevive =
    (state.reviveTasks.learningCompleted && !state.reviveTasks.claimedTaskIds.includes("learning")) ||
    (state.reviveTasks.reviewCompleted && !state.reviveTasks.claimedTaskIds.includes("review"));
  const reviveRemain = state.reviveCounter.maxPerDay - state.reviveCounter.reviveCount;

  const nextLevel = state.levels.find((item) => item.unlockPrevLevelId === level.id);

  const onRevive = async (type: "task" | "points") => {
    try {
      setReviveBusy(true);
      setReviveMsg("");
      await actions.revive(type);
      setReviveMsg("复活成功，生命值已恢复为 1");
    } catch (error) {
      setReviveMsg(error instanceof Error ? error.message : "复活失败，请重试");
    } finally {
      setReviveBusy(false);
    }
  };

  return (
    <PageShell title="挑战结算" showBack backTo="/levels">
      <div className="result-card">
        <p className={`result-badge ${isPass ? "pass" : "fail"}`}>{isPass ? "通关成功" : "挑战失败"}</p>
        <h2>{level.name}</h2>
        <p>得分：{attempt.score ?? 0}</p>
        <p>用时：{formatDuration(attempt.durationMs ?? 0)}</p>
        <p>本次积分：{isPass ? `+${reward}` : "0"}</p>
        <p>生命剩余：{state.lifeAccount.lifeCount}</p>
      </div>

      <div className="section-card">
        <header className="section-header">
          <h3>错误点复盘（时间线）</h3>
        </header>
        <ul className="timeline">
          {attempt.events
            .filter((event) => event.eventType === "step_error" || event.eventType === "step_ok")
            .map((event) => (
              <li key={event.id}>
                <span>{formatDateTime(event.ts)}</span>
                <p>
                  {event.eventType === "step_ok" ? "✅ 正确操作" : event.isKeyError ? "⛔ 关键错误" : "⚠️ 非关键错误"}
                  {" · "}
                  {event.message}
                </p>
              </li>
            ))}
        </ul>
      </div>

      {!isPass && state.lifeAccount.lifeCount <= 0 ? (
        <div className="section-card">
          <header className="section-header">
            <h3>生命值为 0，选择复活方式</h3>
            <span className="tag">今日剩余 {Math.max(reviveRemain, 0)} 次</span>
          </header>
          <p className="muted">任务复活：完成学习资料 / 查看复盘后可领取 +1 生命</p>
          <p className="muted">积分复活：消耗 60 积分恢复 +1 生命</p>
          <div className="grid-two">
            <button
              type="button"
              className="primary-btn"
              disabled={!canTaskRevive || reviveBusy}
              onClick={() => void onRevive("task")}
            >
              任务复活
            </button>
            <button
              type="button"
              className="ghost-btn"
              disabled={state.pointAccount.balance < 60 || reviveBusy}
              onClick={() => void onRevive("points")}
            >
              积分复活
            </button>
          </div>
          {reviveMsg ? <p className="feedback-text">{reviveMsg}</p> : null}
        </div>
      ) : null}

      <div className="grid-two">
        <button type="button" className="primary-btn" onClick={() => navigate(`/levels/${level.id}/prepare`)}>
          再来一次
        </button>
        <button
          type="button"
          className="ghost-btn"
          onClick={() => (nextLevel ? navigate(`/levels/${nextLevel.id}/prepare`) : navigate("/levels"))}
        >
          {nextLevel ? "下一关" : "返回地图"}
        </button>
      </div>

      <button type="button" className="ghost-btn block-btn" onClick={() => navigate("/lobby")}>
        返回大厅
      </button>
    </PageShell>
  );
};
