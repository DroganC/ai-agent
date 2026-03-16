import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Toast } from 'antd-mobile';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Page } from '../../common/Page';
import { PageHeader } from '../../common/PageHeader';
import type { GameRenderProps } from '../renderGame';
import type { AttemptEvent, PlayRouteState } from '../../../types/api';
import { sendEvents, settleAttempt } from '../../../services/attempts';
import { getErrorMessage } from '../../../utils/error';
import { pickDefaultLevelConfig } from './bank';
import type { Category, ClassifyLevelConfig, ClassifyQuestion, ClassifyRunSummary } from './types';
import { formatQuestionShort, makeSummary, shuffle } from './utils';
import './ClassifyChallengeGame.less';

type AnswerSide = Category['id'];

/** 卡片配色主题：'fire' 消防暖色 | 'fresh' 清新绿 | 'ocean' 沉稳蓝 | 'lavender' 柔和紫 */
const CARD_THEME: 'fire' | 'fresh' | 'ocean' | 'lavender' = 'fire';

type Feedback = {
  ok: boolean;
  title: string;
  body: string;
  knowledgePoint?: string;
};

const SWIPE_THRESHOLD_PX = 80;

function useAttemptIdFromRoute(): number | undefined {
  const { state } = useLocation();
  return (state as PlayRouteState | null)?.attemptId;
}

/**
 * 分类大挑战（左右滑动归类）
 * - 移动端：拖拽卡片左/右滑动完成归类
 * - 桌面端/无触摸：提供“左/右”按钮兜底
 *
 * 首版先跑通玩法与结算；attempt 上报在下一步接入（见 attempt-integration-phase2 TODO）。
 */
export default function ClassifyChallengeGame({ level, onExit }: GameRenderProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const attemptId = useAttemptIdFromRoute();

  const config: ClassifyLevelConfig = useMemo(() => {
    // 先用游戏名做弱匹配；后续可改为按 level.id/module_id 映射到后端配置
    return pickDefaultLevelConfig(level.name);
  }, [level.name]);

  const questions: ClassifyQuestion[] = useMemo(() => {
    const take = config.takeCount ?? config.questions.length;
    return shuffle(config.questions).slice(0, Math.min(take, config.questions.length));
  }, [config]);

  const [idx, setIdx] = useState<number>(0);
  const [correct, setCorrect] = useState<number>(0);
  const [errors, setErrors] = useState<number>(0);
  const [keyErrors, setKeyErrors] = useState<number>(0);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isAnimatingOut, setIsAnimatingOut] = useState<boolean>(false);

  const startAtRef = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);
  const questionStartAtRef = useRef<number>(Date.now());
  const pendingEventsRef = useRef<AttemptEvent[]>([]);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<{
    active: boolean;
    pointerId: number | null;
    startX: number;
    startY: number;
    dx: number;
  }>({ active: false, pointerId: null, startX: 0, startY: 0, dx: 0 });

  const current: ClassifyQuestion | undefined = questions[idx];
  const total = questions.length;
  const left = config.categories[0];
  const right = config.categories[1];

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setElapsedMs(Date.now() - startAtRef.current);
    }, 200);
    return () => {
      if (timerRef.current != null) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, []);

  useEffect(() => {
    questionStartAtRef.current = Date.now();
    // 切题时清空“本题反馈”，避免信息滞留
    setFeedback(null);
  }, [idx]);

  const addEvent = useCallback(
    (evt: AttemptEvent) => {
      if (attemptId == null) return;
      pendingEventsRef.current.push(evt);
    },
    [attemptId]
  );

  const endGame = useCallback(
    async (summary: ClassifyRunSummary): Promise<void> => {
      const title = summary.status === 'passed' ? '本关通过' : '本关失败';
      const seconds = Math.max(0, Math.floor(summary.durationMs / 1000));
      try {
        if (attemptId != null) {
          await sendEvents(attemptId, pendingEventsRef.current);
          pendingEventsRef.current = [];
          await settleAttempt(attemptId, {
            status: summary.status === 'passed' ? 'passed' : 'failed',
            duration_ms: summary.durationMs,
            score: summary.score,
            fail_reason:
              summary.status === 'failed'
                ? summary.failReason === 'too_many_errors'
                  ? 'other'
                  : (summary.failReason ?? 'other')
                : undefined,
            error_count: summary.errors,
            key_error_count: summary.keyErrors,
          });
        }
      } catch (e: unknown) {
        Toast.show({ content: getErrorMessage(e, '成绩上报失败（可稍后重试）'), duration: 1800 });
      }

      if (attemptId != null && id != null) {
        navigate(`/level/${id}/${summary.status === 'passed' ? 'pass' : 'settlement'}`, { replace: true, state: { attemptId } });
        return;
      }

      await Modal.alert({
        title,
        content: (
          <div style={{ fontSize: 'var(--font-body)', color: 'var(--color-text)', lineHeight: 1.6 }}>
            <div>游戏：{level.name}</div>
            <div>题目：{summary.correct}/{summary.total} 正确</div>
            <div>错误：{summary.errors} 次（关键错误 {summary.keyErrors} 次）</div>
            <div>用时：{seconds} 秒</div>
            <div style={{ marginTop: 'var(--space-2)', fontWeight: 900 }}>本局积分：{summary.score}</div>
          </div>
        ),
        confirmText: '返回',
      });

      onExit();
    },
    [attemptId, id, level.name, navigate, onExit]
  );

  const finishIfNeeded = useCallback(
    (nextIdx: number, nextCorrect: number, nextErrors: number, nextKeyErrors: number) => {
      const maxErrors = config.maxErrors ?? 999;
      const maxKeyErrors = config.maxKeyErrors ?? 999;
      const durationMs = Date.now() - startAtRef.current;

      const failByErrors = nextErrors > maxErrors;
      const failByKey = nextKeyErrors > maxKeyErrors;
      const done = nextIdx >= total;

      if (failByKey) {
        void endGame(
          makeSummary({
            levelId: config.id,
            total,
            correct: nextCorrect,
            errors: nextErrors,
            keyErrors: nextKeyErrors,
            durationMs,
            status: 'failed',
            failReason: 'key_error',
          })
        );
        return true;
      }
      if (failByErrors) {
        void endGame(
          makeSummary({
            levelId: config.id,
            total,
            correct: nextCorrect,
            errors: nextErrors,
            keyErrors: nextKeyErrors,
            durationMs,
            status: 'failed',
            failReason: 'too_many_errors',
          })
        );
        return true;
      }
      if (done) {
        void endGame(
          makeSummary({
            levelId: config.id,
            total,
            correct: nextCorrect,
            errors: nextErrors,
            keyErrors: nextKeyErrors,
            durationMs,
            status: 'passed',
          })
        );
        return true;
      }
      return false;
    },
    [config.id, config.maxErrors, config.maxKeyErrors, endGame, total]
  );

  const commitAnswer = useCallback(
    async (side: AnswerSide) => {
      if (!current) return;
      if (isAnimatingOut) return;

      const ok = side === current.correctCategoryId;
      const nextIdx = idx + 1;
      const nextCorrect = correct + (ok ? 1 : 0);
      const nextErrors = errors + (ok ? 0 : 1);
      const nextKeyErrors = keyErrors + (!ok && current.isKey ? 1 : 0);

      addEvent({
        event_type: ok ? 'step_ok' : 'step_error',
        step_id: current.id,
        knowledge_point: current.knowledgePoint,
        is_key_error: !ok && current.isKey ? true : false,
        error_type: ok ? undefined : 'other',
        ts: new Date().toISOString(),
      });

      setFeedback({
        ok,
        title: ok ? '正确' : '不对',
        body: current.explain,
        knowledgePoint: current.knowledgePoint,
      });

      // 轻动效：飞出 → 下一题
      const el = cardRef.current;
      if (el) {
        setIsAnimatingOut(true);
        const dir = side === 'left' ? -1 : 1;
        el.style.transition = 'transform 180ms ease-out';
        el.style.transform = `translateX(${dir * 380}px) rotate(${dir * 10}deg)`;
        await new Promise((r) => setTimeout(r, 190));
        el.style.transition = '';
        el.style.transform = '';
        setIsAnimatingOut(false);
      }

      setCorrect(nextCorrect);
      setErrors(nextErrors);
      setKeyErrors(nextKeyErrors);
      setIdx(nextIdx);

      const ended = finishIfNeeded(nextIdx, nextCorrect, nextErrors, nextKeyErrors);
      if (!ended && !ok) {
        Toast.show({ content: current.isKey ? '关键题错误' : '答错了', duration: 900 });
      }
    },
    [addEvent, correct, current, errors, finishIfNeeded, idx, isAnimatingOut, keyErrors]
  );

  const commitTimeout = useCallback(async (): Promise<void> => {
    if (!current) return;
    if (isAnimatingOut) return;
    const nextIdx = idx + 1;
    const nextCorrect = correct;
    const nextErrors = errors + 1;
    const nextKeyErrors = keyErrors + (current.isKey ? 1 : 0);

    addEvent({
      event_type: 'step_error',
      step_id: current.id,
      knowledge_point: current.knowledgePoint,
      is_key_error: current.isKey ? true : false,
      error_type: 'timeout',
      ts: new Date().toISOString(),
    });

    setFeedback({
      ok: false,
      title: '超时',
      body: current.explain,
      knowledgePoint: current.knowledgePoint,
    });
    Toast.show({ content: current.isKey ? '关键题超时' : '本题超时', duration: 900 });

    setCorrect(nextCorrect);
    setErrors(nextErrors);
    setKeyErrors(nextKeyErrors);
    setIdx(nextIdx);
    finishIfNeeded(nextIdx, nextCorrect, nextErrors, nextKeyErrors);
  }, [addEvent, correct, current, errors, finishIfNeeded, idx, isAnimatingOut, keyErrors]);

  // 单题限时：到点自动判定为“超时错误”
  useEffect(() => {
    const limitSeconds = config.perQuestionSeconds;
    if (!limitSeconds) return;
    if (!current) return;
    const t = window.setInterval(() => {
      if (isAnimatingOut) return;
      const used = Date.now() - questionStartAtRef.current;
      if (used >= limitSeconds * 1000) {
        void commitTimeout();
      }
    }, 200);
    return () => window.clearInterval(t);
  }, [commitTimeout, config.perQuestionSeconds, current, isAnimatingOut]);

  const resetCardTransform = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = '';
    el.style.transform = '';
  }, []);

  const applyDragTransform = useCallback((dx: number) => {
    const el = cardRef.current;
    if (!el) return;
    const rot = Math.max(-12, Math.min(12, dx / 18));
    el.style.transform = `translateX(${dx}px) rotate(${rot}deg)`;
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isAnimatingOut) return;
    if (!current) return;
    draggingRef.current.active = true;
    draggingRef.current.pointerId = e.pointerId;
    draggingRef.current.startX = e.clientX;
    draggingRef.current.startY = e.clientY;
    draggingRef.current.dx = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [current, isAnimatingOut]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current.active) return;
    if (draggingRef.current.pointerId !== e.pointerId) return;
    const dx = e.clientX - draggingRef.current.startX;
    const dy = e.clientY - draggingRef.current.startY;
    // 避免上下滚动时误触
    if (Math.abs(dy) > Math.abs(dx) * 1.2) return;
    draggingRef.current.dx = dx;
    applyDragTransform(dx);
  }, [applyDragTransform]);

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current.active) return;
      if (draggingRef.current.pointerId !== e.pointerId) return;
      draggingRef.current.active = false;
      const dx = draggingRef.current.dx;
      draggingRef.current.dx = 0;
      draggingRef.current.pointerId = null;

      if (Math.abs(dx) >= SWIPE_THRESHOLD_PX) {
        void commitAnswer(dx < 0 ? 'left' : 'right');
        return;
      }
      // 回弹
      const el = cardRef.current;
      if (el) {
        el.style.transition = 'transform 140ms ease-out';
        el.style.transform = 'translateX(0px) rotate(0deg)';
        setTimeout(() => resetCardTransform(), 150);
      }
    },
    [commitAnswer, resetCardTransform]
  );

  const onPointerCancel = useCallback(() => {
    draggingRef.current.active = false;
    draggingRef.current.pointerId = null;
    draggingRef.current.dx = 0;
    resetCardTransform();
  }, [resetCardTransform]);

  const onBack = useCallback(() => {
    void Modal.confirm({
      title: '退出本局？',
      content: '退出后本局不会计入成绩。',
      confirmText: '退出',
      cancelText: '继续',
      onConfirm: () => {
        if (attemptId != null) {
          // 最小化上报：标记为中断，方便后续统计（失败原因：manual_abort）
          void (async () => {
            try {
              await settleAttempt(attemptId, { status: 'aborted', fail_reason: 'manual_abort' });
            } catch {
              // ignore
            }
          })();
        }
        onExit();
      },
    });
  }, [attemptId, onExit]);

  // 小兜底：若 questions 为空（理论不会），提示并退出
  useEffect(() => {
    if (questions.length === 0) {
      Toast.show({ content: '题库为空，无法开始', duration: 1200 });
      onExit();
    }
  }, [onExit, questions.length]);

  const subtitle = useMemo(() => {
    const s = Math.floor(elapsedMs / 1000);
    return `第 ${Math.min(idx + 1, total)} / ${total} 题 · 正确 ${correct} · 错误 ${errors} · 用时 ${s}s`;
  }, [correct, elapsedMs, errors, idx, total]);

  const currentText = current ? formatQuestionShort(current) : '—';

  return (
    <Page showTab={false}>
      <div className={`classify-challenge classify-challenge--theme-${CARD_THEME}`}>
        <PageHeader title={level.name} description={subtitle} onBack={onBack} />

        <div className="classify-challenge-board">
          <div className="classify-challenge-targets">
            <div className="classify-challenge-target" aria-label={`左：${left.label}`}>
              <div className="classify-challenge-target-label">{left.label}</div>
              <div className="classify-challenge-target-badge">{left.badge ?? '⬅️'}</div>
            </div>
            <div className="classify-challenge-target" aria-label={`右：${right.label}`}>
              <div className="classify-challenge-target-label">{right.label}</div>
              <div className="classify-challenge-target-badge">{right.badge ?? '➡️'}</div>
            </div>
          </div>

          <div className="classify-challenge-card-wrap">
            <div
              ref={cardRef}
              className="classify-challenge-card"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
              role="group"
              aria-label="题目卡片"
            >
              <div className="classify-challenge-card-title">{current?.title ?? '本关结束'}</div>
              {current?.subtitle && <div className="classify-challenge-card-subtitle">{current.subtitle}</div>}
              <div className="classify-challenge-hint">提示：左滑=“{left.label}”，右滑=“{right.label}”</div>
              <div className="classify-challenge-hint">当前：{currentText}</div>
            </div>
          </div>
        </div>

        {feedback && (
          <div className="classify-challenge-feedback" role="status" aria-live="polite">
            <div className="classify-challenge-feedback-title">
              {feedback.ok ? '✅ 正确' : '⛔ 不对'} {feedback.knowledgePoint ? `· ${feedback.knowledgePoint}` : ''}
            </div>
            <div className="classify-challenge-feedback-body">{feedback.body}</div>
          </div>
        )}
      </div>
    </Page>
  );
}

