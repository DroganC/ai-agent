import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageShell } from "../components/PageShell";
import type { InteractionMode, InteractionOutcome } from "../components/interactive/LevelArena";
import { useApp } from "../context/AppContext";
import { LevelStep } from "../types/domain";
import { clamp, formatDuration } from "../utils/helpers";

const LevelArena = lazy(async () => {
  const module = await import("../components/interactive/LevelArena");
  return { default: module.LevelArena };
});

const interactionModes: InteractionMode[] = ["timing", "drag", "sequence"];
const interactionModeLabel: Record<InteractionMode, string> = {
  timing: "节奏锁定",
  drag: "拖拽校准",
  sequence: "流程激活",
};

const pickOptionByOutcome = (step: LevelStep, outcome: InteractionOutcome) => {
  const correct = step.options.find((option) => option.isCorrect);
  const wrongOptions = step.options.filter((option) => !option.isCorrect);

  if (!correct && wrongOptions.length > 0) {
    return wrongOptions[0].id;
  }

  if (outcome === "success" || wrongOptions.length === 0) {
    return (correct ?? step.options[0]).id;
  }

  const selectedWrong =
    outcome === "critical"
      ? wrongOptions.find((option) => option.isKeyError) ?? wrongOptions[0]
      : wrongOptions.find((option) => !option.isKeyError) ?? wrongOptions[0];
  return selectedWrong.id;
};

export const LevelPlayPage = () => {
  const { levelId: levelIdParam, attemptId } = useParams();
  const levelId = Number(levelIdParam);
  const navigate = useNavigate();
  const { state, actions } = useApp();

  const level = useMemo(() => state.levels.find((item) => item.id === levelId), [state.levels, levelId]);
  const attempt = attemptId ? state.attemptsById[attemptId] : undefined;

  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(100);
  const [feedback, setFeedback] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [busy, setBusy] = useState(false);
  const settledRef = useRef(false);

  useEffect(() => {
    if (!attempt) return;
    const timer = window.setInterval(() => {
      const duration = Date.now() - new Date(attempt.startAt).getTime();
      setElapsed(Math.max(duration, 0));
    }, 500);
    return () => window.clearInterval(timer);
  }, [attempt]);

  const settleAndGoResult = async (
    status: "passed" | "failed" | "aborted",
    finalScore: number,
    failReason?: "timeout" | "key_error" | "manual_abort" | "other",
  ) => {
    if (!attempt || !attemptId || settledRef.current) return;
    settledRef.current = true;
    try {
      setBusy(true);
      await actions.finishAttempt({
        attemptId,
        status,
        score: finalScore,
        failReason,
      });
      navigate(`/attempts/${attemptId}/result`, { replace: true });
    } catch (error) {
      settledRef.current = false;
      window.alert(error instanceof Error ? error.message : "结算失败，请重试");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!level || !attempt || !attemptId) return;
    if (attempt.status !== "in_progress") {
      navigate(`/attempts/${attempt.id}/result`, { replace: true });
      return;
    }
    if (elapsed >= level.passRule.timeoutMs && !settledRef.current) {
      setFeedback("挑战超时，正在结算...");
      void settleAndGoResult("failed", score, "timeout");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, level, attempt, attemptId]);

  if (!level || !attempt || !attemptId) {
    return (
      <PageShell title="关卡进行中" showBack>
        <div className="state-block error">挑战不存在，请返回重试</div>
      </PageShell>
    );
  }

  const step = level.steps[currentStep];
  const progressText = `${currentStep + 1}/${level.steps.length}`;
  const interactionMode = interactionModes[(level.id + currentStep) % interactionModes.length];

  const onChooseOption = async (optionId: string) => {
    if (!step || busy) return;
    try {
      setBusy(true);
      const result = await actions.submitStepEvent({
        attemptId,
        stepId: step.id,
        knowledgePoint: step.knowledgePoint,
        optionId,
      });
      setFeedback(result.tip);

      if (!result.isCorrect) {
        const nextScore = clamp(score - result.penalty, 0, 100);
        setScore(nextScore);
        if (result.isKeyError) {
          await settleAndGoResult("failed", nextScore, "key_error");
        }
        return;
      }

      const isLastStep = currentStep >= level.steps.length - 1;
      if (isLastStep) {
        await settleAndGoResult("passed", score);
        return;
      }
      setCurrentStep((prev) => prev + 1);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "步骤提交失败，请重试");
    } finally {
      setBusy(false);
    }
  };

  /**
   * 互动关卡只产出“成功/失败/严重失败”结果，
   * 再映射到当前步骤配置的 option，从而复用现有判分和结算链路。
   */
  const onResolveArena = async (outcome: InteractionOutcome) => {
    if (!step) return;
    const optionId = pickOptionByOutcome(step, outcome);
    await onChooseOption(optionId);
  };

  return (
    <PageShell
      title="关卡进行中"
      showBack
      backTo={`/levels/${level.id}/prepare`}
      rightSlot={<span className="timer-chip">{formatDuration(elapsed)}</span>}
    >
      <div className="section-card">
        <header className="section-header">
          <h3>{level.name}</h3>
          <span className="tag">步骤 {progressText}</span>
        </header>
        <p className="muted">当前得分：{score}</p>
        <p className="muted">超时阈值：{Math.floor(level.passRule.timeoutMs / 1000)} 秒</p>
      </div>

      {step ? (
        <div className="section-card">
          <header className="section-header">
            <h3>{step.title}</h3>
            <span className="tag">模式：{interactionModeLabel[interactionMode]}</span>
          </header>
          <p className="muted">知识点：{step.knowledgePoint}</p>
          <Suspense fallback={<div className="state-block">正在加载 Phaser 场景...</div>}>
            <LevelArena step={step} mode={interactionMode} busy={busy} onResolve={onResolveArena} />
          </Suspense>
        </div>
      ) : null}

      {feedback ? <p className="feedback-text">{feedback}</p> : null}

      <button
        type="button"
        className="ghost-btn block-btn"
        disabled={busy}
        onClick={() => {
          if (window.confirm("确认退出当前挑战？本次将记为中止。")) {
            void settleAndGoResult("aborted", score, "manual_abort");
          }
        }}
      >
        退出挑战
      </button>
    </PageShell>
  );
};
