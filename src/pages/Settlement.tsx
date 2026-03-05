import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchAttemptReview } from '../services/attempts';
import { Page } from '../components/common/Page';
import { Loading } from '../components/common/Loading';
import { ErrorView } from '../components/common/ErrorView';
import { Button } from '../components/common/Button';
import { Icon } from '../icons';
import type { AttemptReview, AttemptReviewTimelineItem, PlayRouteState } from '../types/api';
import { getErrorMessage } from '../utils/error';

export const Settlement = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation();
  const attemptId = (state as PlayRouteState | null)?.attemptId;
  const navigate = useNavigate();
  const [data, setData] = useState<AttemptReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!attemptId) return;
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
    run();
  }, [attemptId]);

  if (!attemptId) return <ErrorView message="缺少 attemptId" onRetry={() => navigate(`/level/${id}/prepare`, { replace: true })} />;
  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={() => navigate(0)} />;

  return (
    <Page showTab={false}>
      <div className="mt-6 space-y-4">
        <div className="card p-5 text-center shadow-sm">
          <div className="text-lg font-semibold text-primary">结算完成</div>
          <div className="text-sm text-gray-500 mt-1">成绩已记录，可查看复盘</div>
        </div>
        <div className="card p-4 shadow-sm">
          <div className="font-semibold mb-2 text-[#1f1f3d]">错误时间线</div>
          <div className="space-y-3 relative pl-5">
            <div className="absolute left-[10px] top-0 bottom-0 w-px bg-slate-200" />
            {data?.timeline?.map((item: AttemptReviewTimelineItem, idx: number) => (
              <div key={idx} className="flex justify-between text-sm text-gray-700 relative">
                <div className="absolute -left-[11px] mt-1 w-3 h-3 rounded-full bg-primary shadow" />
                <span className="pl-2">{item.step}</span>
                <span className="text-gray-500 flex items-center gap-1">
                  <Icon name={item.result === 'ok' ? 'success' : 'error'} size={14} weight="fill" className={item.result === 'ok' ? 'text-green-600' : 'text-red-500'} />
                  {item.result}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <Button full onClick={() => navigate(`/level/${id}/play`, { state: { attemptId } })}>
            再来一次
          </Button>
          <Button full variant="secondary" onClick={() => navigate('/levels')}>
            返回关卡
          </Button>
        </div>
      </div>
    </Page>
  );
};
