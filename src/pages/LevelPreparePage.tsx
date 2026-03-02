import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageShell } from "../components/PageShell";
import { useApp } from "../context/AppContext";

export const LevelPreparePage = () => {
  const { levelId: levelIdParam } = useParams();
  const levelId = Number(levelIdParam);
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const level = useMemo(() => state.levels.find((item) => item.id === levelId), [state.levels, levelId]);
  const progress = level ? state.progressByLevel[level.id] : undefined;

  const startChallenge = async () => {
    if (!level) return;
    try {
      setLoading(true);
      setErrorText("");
      const attemptId = await actions.startAttempt(level.id);
      navigate(`/levels/${level.id}/play/${attemptId}`);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "启动挑战失败");
    } finally {
      setLoading(false);
    }
  };

  if (!level || !progress) {
    return (
      <PageShell title="关卡准备" showBack>
        <div className="state-block error">关卡不存在或已下架</div>
      </PageShell>
    );
  }

  return (
    <PageShell title="关卡准备" showBack backTo="/levels">
      <div className="section-card">
        <header className="section-header">
          <h3>{level.name}</h3>
          <span className="tag">难度 {level.difficulty} 星</span>
        </header>
        <p className="muted">预计时长：{level.estimatedSeconds} 秒</p>
        <p className="muted">通关奖励：{level.rewardPoints} 积分</p>
        <p className="muted">最低得分：{level.passRule.minScore} 分</p>
        <p className="muted">超时阈值：{Math.floor(level.passRule.timeoutMs / 1000)} 秒</p>
      </div>

      <div className="section-card">
        <header className="section-header">
          <h3>知识与操作要点</h3>
        </header>
        <ol className="ordered-list">
          {level.knowledgePoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ol>
      </div>

      <div className="section-card">
        <header className="section-header">
          <h3>挑战状态</h3>
        </header>
        <p className="muted">生命值：{state.lifeAccount.lifeCount}</p>
        <p className="muted">累计通关：{progress.passCount} 次</p>
      </div>

      {errorText ? <p className="error-text">{errorText}</p> : null}

      <button type="button" className="primary-btn block-btn" onClick={() => void startChallenge()} disabled={loading}>
        {loading ? "正在创建挑战..." : "开始挑战"}
      </button>
    </PageShell>
  );
};
