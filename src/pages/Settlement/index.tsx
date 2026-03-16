import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { fetchAttemptReview } from '../../services/attempts';
import { Page } from '../../components/common/Page';
import { PageHeader } from '../../components/common/PageHeader';
import { Loading } from '../../components/common/Loading';
import { ErrorView } from '../../components/common/ErrorView';
import { Button } from '../../components/common/Button';
import { Icon } from '../../icons';
import type { AttemptReview, AttemptReviewTimelineItem, PlayRouteState } from '../../types/api';
import { getErrorMessage } from '../../utils/error';
import { Card, List, Space, Tag } from 'antd-mobile';

/**
 * 关卡结算页
 * 从路由 state 取 attemptId，拉取复盘数据并展示「结算完成」与错误时间线
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

  const goPrepare = useCallback((): void => {
    if (id != null) {
      navigate(`/level/${id}/prepare`, { replace: true });
    } else {
      navigate('/levels', { replace: true });
    }
  }, [id, navigate]);

  if (attemptId == null) return <ErrorView message="缺少 attemptId，请从关卡准备页开始" onRetry={() => navigate(id != null ? `/level/${id}/prepare` : '/levels', { replace: true })} />;
  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={() => navigate(0)} />;

  return (
    <Page showTab={false}>
      <div style={{ padding: 'var(--page-padding) var(--page-padding) 0', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <PageHeader title="结算" onBack={() => navigate(-1)} />
        <Card style={{ borderRadius: 'var(--radius-card)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--font-h2)', fontWeight: 800, color: 'var(--adm-color-primary)' }}>结算完成</div>
            <div style={{ fontSize: 'var(--font-caption)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>成绩已记录，可查看复盘</div>
          </div>
        </Card>

        <div>
          <div className="sectionTitle">错误时间线</div>
          <Card style={{ borderRadius: 'var(--radius-card)' }}>
            <List style={{ '--border-inner': 'none' } as never}>
              {data?.timeline?.map((item: AttemptReviewTimelineItem, idx: number) => (
                <List.Item
                  key={`${item.ts}-${idx}`}
                  extra={
                    <Tag color={item.result === 'ok' ? 'success' : 'danger'} fill="outline">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                        <Icon name={item.result === 'ok' ? 'success' : 'error'} size={14} weight="fill" />
                        {item.result}
                      </span>
                    </Tag>
                  }
                >
                  {item.step}
                </List.Item>
              ))}
            </List>
          </Card>
        </div>

        <Space direction="horizontal" block>
          <Button full onClick={goPrepare}>
            再来一次
          </Button>
          <Button full variant="secondary" onClick={() => navigate('/levels')}>
            返回关卡
          </Button>
        </Space>
      </div>
    </Page>
  );
}
