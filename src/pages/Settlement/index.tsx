import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useBackToLevels } from '../../app/useBackToLevels';
import { fetchAttemptReview } from '../../services/attempts';
import { fetchLevel } from '../../services/levels';
import { Loading } from '../../components/common/Loading';
import { ErrorView } from '../../components/common/ErrorView';
import { LevelResultLayout } from '../../components/common/LevelResultLayout';
import { Icon } from '../../icons';
import type { AttemptReview, AttemptReviewTimelineItem, GameType, Level, PlayRouteState } from '../../types/api';
import { getErrorMessage } from '../../utils/error';
import { pickDefaultLevelConfig } from '../../components/games/spot-difference/bank';
import type { DifferenceRegion } from '../../components/games/spot-difference/types';

/**
 * 游戏结算页（未通过 / 失败）
 * 从路由 state 取 attemptId，拉取复盘数据并展示。
 * - 大家来找茬：展示「未找到的差异」列表（两图中尚未找出的差异）
 * - 其他游戏：展示「错误题目」时间线
 * 顶部大标题、底部吸底与通关页共用 LevelResultLayout。
 */
export function Settlement() {
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation();
  const attemptId: number | undefined = (state as PlayRouteState | null)?.attemptId;
  const navigate = useNavigate();

  const [data, setData] = useState<AttemptReview | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const levelId = id != null ? Number(id) : NaN;

  useEffect(() => {
    const run = async (): Promise<void> => {
      if (attemptId == null) return;
      try {
        setLoading(true);
        const reviewResp = await fetchAttemptReview(attemptId);
        setData(reviewResp);
        setError(null);
        if (Number.isFinite(levelId)) {
          try {
            const levelResp = await fetchLevel(levelId);
            setLevel(levelResp);
          } catch {
            setLevel(null);
          }
        } else {
          setLevel(null);
        }
      } catch (e: unknown) {
        setError(getErrorMessage(e, '加载失败'));
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [attemptId, levelId]);

  const backToLevels = useBackToLevels();
  const goPrepare = useCallback((): void => {
    if (id != null) {
      navigate(`/level/${id}/prepare`, { replace: true });
    } else {
      backToLevels();
    }
  }, [id, navigate, backToLevels]);

  const gameType: GameType | undefined = level?.game_type;

  /** 大家来找茬：根据复盘 timeline 中 result===ok 的 step 与关卡配置，算出未找到的差异 */
  const unfoundDifferences = useMemo((): DifferenceRegion[] => {
    if (gameType !== 'spot-difference' || !level || !data?.timeline) return [];
    const config = pickDefaultLevelConfig(level.name, level.id);
    const foundIds = new Set(
      data.timeline.filter((t) => t.result === 'ok').map((t) => t.step)
    );
    return config.differences.filter((d) => !foundIds.has(d.id));
  }, [gameType, level, data?.timeline]);

  const isSpotDifference = gameType === 'spot-difference';

  if (attemptId == null) {
    return (
      <ErrorView
        message="缺少 attemptId，请从游戏准备页开始"
        onRetry={() => (id != null ? navigate(`/level/${id}/prepare`, { replace: true }) : backToLevels())}
      />
    );
  }
  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={() => navigate(0)} />;

  return (
    <LevelResultLayout
      title="结算完成"
      description="成绩已记录，可查看复盘"
      onBackToLevels={backToLevels}
      onReplay={goPrepare}
    >
      {isSpotDifference ? (
        <div className="game-intro__block">
          <div className="sectionTitle">未找到的差异</div>
          <div className="sectionCard game-intro__card settlement-errors">
            {unfoundDifferences.length > 0 ? (
              <ul className="settlement-errors__list">
                {unfoundDifferences.map((diff, idx) => (
                  <li key={diff.id} className="settlement-errors__item">
                    <div className="settlement-errors__content">
                      <span className="settlement-errors__step">
                        {diff.knowledgePoint ?? `差异 ${idx + 1}`}
                      </span>
                    </div>
                    <span className="settlement-errors__badge settlement-errors__badge--error">
                      <Icon name="error" size={14} weight="fill" />
                      未找到
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="subtle" style={{ textAlign: 'center', padding: 'var(--space-3) 0' }}>
                已找全所有差异
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="game-intro__block">
          <div className="sectionTitle">错误题目</div>
          <div className="sectionCard game-intro__card settlement-errors">
            {data?.timeline?.length ? (
              <ul className="settlement-errors__list">
                {data.timeline.map((item: AttemptReviewTimelineItem, idx: number) => (
                  <li key={`${item.ts}-${idx}`} className="settlement-errors__item">
                    <div className="settlement-errors__content">
                      <span className="settlement-errors__step">{item.step}</span>
                      {item.knowledge_point && (
                        <span className="subtle settlement-errors__tip">{item.knowledge_point}</span>
                      )}
                    </div>
                    <span className={`settlement-errors__badge settlement-errors__badge--${item.result}`}>
                      <Icon name={item.result === 'ok' ? 'success' : 'error'} size={14} weight="fill" />
                      {item.result === 'ok' ? '正确' : '错误'}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="subtle" style={{ textAlign: 'center', padding: 'var(--space-3) 0' }}>
                暂无错题记录
              </div>
            )}
          </div>
        </div>
      )}
    </LevelResultLayout>
  );
}
