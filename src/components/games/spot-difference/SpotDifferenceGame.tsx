import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Toast } from 'antd-mobile';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Page } from '../../common/Page';
import { PageHeader } from '../../common/PageHeader';
import { Button } from '../../common/Button';
import type { GameRenderProps } from '../renderGame';
import type { AttemptEvent, PlayRouteState } from '../../../types/api';
import { sendEvents, settleAttempt } from '../../../services/attempts';
import { getErrorMessage } from '../../../utils/error';
import { pickDefaultLevelConfig } from './bank';
import type { SpotDifferenceLevelConfig, SpotDifferenceRunSummary } from './types';
import { clientToRatio, isPointInRect } from './utils';
import './SpotDifferenceGame.less';

function useAttemptIdFromRoute(): number | undefined {
  const { state } = useLocation();
  return (state as PlayRouteState | null)?.attemptId;
}

function makeSummary(params: {
  levelId: string;
  total: number;
  found: number;
  wrongClicks: number;
  durationMs: number;
  status: SpotDifferenceRunSummary['status'];
  failReason?: SpotDifferenceRunSummary['failReason'];
}): SpotDifferenceRunSummary {
  const { total, found, wrongClicks, durationMs, status } = params;
  const baseScore = Math.max(0, found * 15);
  const timeBonus = status === 'passed' ? Math.max(0, 30 - Math.floor(durationMs / 5000)) * 2 : 0;
  return {
    levelId: params.levelId,
    total,
    found,
    wrongClicks,
    durationMs,
    score: baseScore + timeBonus,
    status,
    failReason: params.failReason,
  };
}

/**
 * 大家来找茬（移动端上下两图）
 * 点击上图或下图，命中未找过的差异区域即判对；找全通过，限时/错误次数超限失败。
 */
export default function SpotDifferenceGame({ level, onExit }: GameRenderProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const attemptId = useAttemptIdFromRoute();

  const config: SpotDifferenceLevelConfig = useMemo(
    () => pickDefaultLevelConfig(level.name, level.id),
    [level.name, level.id]
  );

  const differences = useMemo(() => config.differences, [config]);
  const total = differences.length;

  const [foundIds, setFoundIds] = useState<Set<string>>(() => new Set());
  const [wrongClicks, setWrongClicks] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    config.totalSeconds ?? 0
  );
  const [ended, setEnded] = useState(false);
  const [imageErrorTop, setImageErrorTop] = useState(false);
  const [imageErrorBottom, setImageErrorBottom] = useState(false);

  const startAtRef = useRef<number>(Date.now());
  const pendingEventsRef = useRef<AttemptEvent[]>([]);
  const topImageRef = useRef<HTMLDivElement | null>(null);
  const bottomImageRef = useRef<HTMLDivElement | null>(null);
  /** 同步标记，防止 endGame 被重复调用（如找全与倒计时同时触发） */
  const endedRef = useRef<boolean>(false);
  /** 供定时器读取最新值，避免闭包陈旧 */
  const foundIdsRef = useRef<Set<string>>(foundIds);
  const wrongClicksRef = useRef<number>(wrongClicks);

  useEffect(() => {
    foundIdsRef.current = foundIds;
  }, [foundIds]);
  useEffect(() => {
    wrongClicksRef.current = wrongClicks;
  }, [wrongClicks]);

  const addEvent = useCallback(
    (evt: AttemptEvent) => {
      if (attemptId == null) return;
      pendingEventsRef.current.push(evt);
    },
    [attemptId]
  );

  const endGame = useCallback(
    async (summary: SpotDifferenceRunSummary): Promise<void> => {
      if (endedRef.current) return;
      endedRef.current = true;
      setEnded(true);

      try {
        if (attemptId != null) {
          await sendEvents(attemptId, pendingEventsRef.current);
          pendingEventsRef.current = [];
          await settleAttempt(attemptId, {
            status: summary.status === 'passed' ? 'passed' : summary.status === 'aborted' ? 'aborted' : 'failed',
            duration_ms: summary.durationMs,
            score: summary.score,
            fail_reason:
              summary.status === 'failed'
                ? summary.failReason === 'timeout'
                  ? 'timeout'
                  : 'other'
                : summary.status === 'aborted'
                  ? 'manual_abort'
                  : undefined,
            error_count: summary.wrongClicks,
          });
        }
      } catch (e: unknown) {
        Toast.show({ content: getErrorMessage(e, '成绩上报失败'), duration: 1800 });
      }

      if (attemptId != null && id != null) {
        const path =
          summary.status === 'passed'
            ? 'pass'
            : summary.status === 'aborted'
              ? 'prepare'
              : 'settlement';
        if (path === 'prepare') {
          onExit();
          return;
        }
        navigate(`/level/${id}/${path}`, { replace: true, state: { attemptId } });
        return;
      }

      await Modal.alert({
        title: summary.status === 'passed' ? '找全了！' : summary.status === 'failed' ? '本关未通过' : '已退出',
        content: (
          <div style={{ fontSize: 'var(--font-body)', color: 'var(--color-text)', lineHeight: 1.6 }}>
            <div>找到 {summary.found}/{summary.total} 处差异</div>
            <div>错误点击 {summary.wrongClicks} 次</div>
            <div>用时 {Math.floor(summary.durationMs / 1000)} 秒</div>
            {summary.status === 'passed' && <div style={{ marginTop: 'var(--space-2)', fontWeight: 900 }}>积分 +{summary.score}</div>}
          </div>
        ),
        confirmText: '返回',
      });
      onExit();
    },
    [attemptId, id, navigate, onExit]
  );

  // 限时倒计时（用 ref 读取最新 found/wrong，避免闭包陈旧）
  useEffect(() => {
    if (config.totalSeconds == null || config.totalSeconds <= 0 || ended) return;
    setRemainingSeconds(config.totalSeconds);
    const t = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          const durationMs = Date.now() - startAtRef.current;
          void endGame(
            makeSummary({
              levelId: config.id,
              total,
              found: foundIdsRef.current.size,
              wrongClicks: wrongClicksRef.current,
              durationMs,
              status: 'failed',
              failReason: 'timeout',
            })
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [config.id, config.totalSeconds, total, ended, endGame]);

  const handleImageClick = useCallback(
    (side: 'top' | 'bottom', e: React.MouseEvent<HTMLDivElement>) => {
      if (endedRef.current) return;
      const wrapRef = side === 'top' ? topImageRef : bottomImageRef;
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect) return;

      const { x, y } = clientToRatio(e.clientX, e.clientY, rect);
      const hit = differences.find(
        (d) => !foundIdsRef.current.has(d.id) && isPointInRect(x, y, side === 'top' ? d.top : d.bottom)
      );

      if (hit) {
        const nextFound = new Set(foundIdsRef.current).add(hit.id);
        setFoundIds(nextFound);
        addEvent({
          event_type: 'step_ok',
          step_id: hit.id,
          knowledge_point: hit.knowledgePoint,
          ts: new Date().toISOString(),
        });
        if (hit.knowledgePoint) {
          Toast.show({ content: hit.knowledgePoint, duration: 1200 });
        } else {
          Toast.show({ content: '找对了！', duration: 800 });
        }
        if (nextFound.size >= total) {
          const durationMs = Date.now() - startAtRef.current;
          void endGame(
            makeSummary({
              levelId: config.id,
              total,
              found: total,
              wrongClicks,
              durationMs,
              status: 'passed',
            })
          );
        }
      } else {
        const nextWrong = wrongClicksRef.current + 1;
        setWrongClicks(nextWrong);
        addEvent({
          event_type: 'step_error',
          step_id: 'wrong_click',
          error_type: 'mis_touch',
          ts: new Date().toISOString(),
        });
        Toast.show({ content: '再想想', duration: 800 });

        const maxWrong = config.maxWrongClicks ?? 999;
        if (nextWrong >= maxWrong) {
          const durationMs = Date.now() - startAtRef.current;
          void endGame(
            makeSummary({
              levelId: config.id,
              total,
              found: foundIdsRef.current.size,
              wrongClicks: nextWrong,
              durationMs,
              status: 'failed',
              failReason: 'other',
            })
          );
        }
      }
    },
    [addEvent, config.id, config.maxWrongClicks, differences, total, endGame]
  );

  const handleExit = useCallback(() => {
    Modal.confirm({
      content: '确定退出本局？当前进度将不保存。',
      confirmText: '退出',
      cancelText: '继续玩',
      onConfirm: () => {
        const durationMs = Date.now() - startAtRef.current;
        void endGame(
          makeSummary({
            levelId: config.id,
            total,
            found: foundIds.size,
            wrongClicks,
            durationMs,
            status: 'aborted',
            failReason: 'manual_abort',
          })
        );
      },
    });
  }, [config.id, endGame, foundIds.size, total, wrongClicks]);

  const foundCount = foundIds.size;
  const showTimer = config.totalSeconds != null && config.totalSeconds > 0;
  const showWrong =
    config.maxWrongClicks != null &&
    Number.isFinite(config.maxWrongClicks) &&
    config.maxWrongClicks < 9999;

  /** 已找差异在上图/下图上的标记（比例定位） */
  const renderMarkers = (side: 'top' | 'bottom') =>
    differences
      .filter((d) => foundIds.has(d.id))
      .map((d) => {
        const r = side === 'top' ? d.top : d.bottom;
        return (
          <div
            key={d.id}
            className="spot-difference__marker"
            style={{
              left: `${r.x * 100}%`,
              top: `${r.y * 100}%`,
              width: `${r.w * 100}%`,
              height: `${r.h * 100}%`,
            }}
          />
        );
      });

  return (
    <Page showTab={false}>
      <div className="screen">
        <div className="stack">
          <PageHeader title={level.name} description="上下两图，点击找出所有差异" onBack={handleExit} />

          <div className="spot-difference">
            <div className="spot-difference__progress">
              <span className="spot-difference__progress-text">已找 {foundCount}/{total}</span>
              {showWrong && <span className="subtle">错误 {wrongClicks}/{config.maxWrongClicks}</span>}
              {showTimer && <span className="subtle">剩余 {remainingSeconds} 秒</span>}
            </div>

            <div className="spot-difference__scroll">
              <div className="spot-difference__image-wrap" ref={topImageRef}>
                {imageErrorTop ? (
                  <div className="spot-difference__image-fallback">上图加载失败</div>
                ) : (
                  <img
                    src={config.imageTop}
                    alt="上图"
                    draggable={false}
                    onError={() => {
                      setImageErrorTop(true);
                      Toast.show({ content: '上图加载失败', duration: 2000 });
                    }}
                  />
                )}
                <div
                  className="spot-difference__image-hit"
                  onClick={(e) => handleImageClick('top', e)}
                  aria-hidden
                />
                {renderMarkers('top')}
              </div>
              <div className="spot-difference__divider" />
              <div className="spot-difference__image-wrap" ref={bottomImageRef}>
                {imageErrorBottom ? (
                  <div className="spot-difference__image-fallback">下图加载失败</div>
                ) : (
                  <img
                    src={config.imageBottom}
                    alt="下图"
                    draggable={false}
                    onError={() => {
                      setImageErrorBottom(true);
                      Toast.show({ content: '下图加载失败', duration: 2000 });
                    }}
                  />
                )}
                <div
                  className="spot-difference__image-hit"
                  onClick={(e) => handleImageClick('bottom', e)}
                  aria-hidden
                />
                {renderMarkers('bottom')}
              </div>
            </div>

            <div className="spot-difference__footer">
              <Button full variant="secondary" onClick={handleExit}>
                退出本局
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
