import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { useBackToLevels } from '../../app/useBackToLevels';
import { fetchAttemptReview } from '../../services/attempts';
import { Page } from '../../components/common/Page';
import { PageHeader } from '../../components/common/PageHeader';
import { Loading } from '../../components/common/Loading';
import { ErrorView } from '../../components/common/ErrorView';
import { Button } from '../../components/common/Button';
import { Icon } from '../../icons';
import type { AttemptReview, AttemptReviewTimelineItem, PlayRouteState } from '../../types/api';
import { getErrorMessage } from '../../utils/error';

/**
 * 游戏结算页
 * 从路由 state 取 attemptId，拉取复盘数据并展示「结算完成」与错误题目列表
 */
export function Settlement() {
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation();
  const attemptId: number | undefined = (state as PlayRouteState | null)?.attemptId;
  const navigate = useNavigate();

  const [data, setData] = useState<AttemptReview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /** 根据 attemptId 拉取复盘数据 */
  useEffect(() => {
    const run = async (): Promise<void> => {
      if (attemptId == null) return;
      try {
        setLoading(true);
        const resp = await fetchAttemptReview(attemptId);
        setData(resp);
        setError(null);
      } catch (e: unknown) {
        setError(getErrorMessage(e, '加载失败'));
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [attemptId]);

  const backToLevels = useBackToLevels();
  const goPrepare = useCallback((): void => {
    if (id != null) {
      navigate(`/level/${id}/prepare`, { replace: true });
    } else {
      backToLevels();
    }
  }, [id, navigate, backToLevels]);

  if (attemptId == null) return <ErrorView message="缺少 attemptId，请从游戏准备页开始" onRetry={() => (id != null ? navigate(`/level/${id}/prepare`, { replace: true }) : backToLevels())} />;
  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={() => navigate(0)} />;

  return (
    <Page showTab={false}>
      <div className="game-intro">
        <div className="game-intro__scroll">
          <PageHeader
            title="结算"
            description="成绩已记录，可查看复盘"
            onBack={() => navigate(-1)}
          />

          <div className="game-intro__block">
            <div className="sectionCard game-intro__card">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--font-h2)', fontWeight: 800, color: 'var(--adm-color-primary)' }}>结算完成</div>
                <div className="subtle" style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-body)' }}>成绩已记录，可查看复盘</div>
              </div>
            </div>
          </div>

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

          <div className="game-intro__spacer" />
        </div>

        <div className="game-intro__bottom">
          <div className="game-intro__btn-wrap">
            <Button variant="secondary" full onClick={backToLevels}>
              返回游戏
            </Button>
          </div>
          <div className="game-intro__btn-wrap">
            <Button full onClick={goPrepare}>
              再来一次
            </Button>
          </div>
        </div>
      </div>
    </Page>
  );
}
