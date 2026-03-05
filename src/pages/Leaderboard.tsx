import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { fetchLeaderboard } from '../services/leaderboard';
import { LeaderboardItem } from '../types/api';
import { Page } from '../components/common/Page';
import { Loading } from '../components/common/Loading';
import { ErrorView } from '../components/common/ErrorView';
import { Icon } from '../icons';
import { ProgressMini } from '../components/common/ProgressMini';
import { getErrorMessage } from '../utils/error';

export const Leaderboard = observer(() => {
  const [data, setData] = useState<LeaderboardItem[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const resp = await fetchLeaderboard();
      setData(resp.items);
      setUpdatedAt(resp.updatedAt);
      setError(null);
    } catch (e: unknown) {
      setError(getErrorMessage(e, '加载失败'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  return (
    <Page>
      <div className="mt-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-[#1f1f3d]">Leaderboard</div>
          <button className="px-3 py-2 rounded-full bg-primary text-white text-sm shadow-sm flex items-center gap-1" onClick={load}>
            <Icon name="refresh" size={16} weight="bold" />
            刷新
          </button>
        </div>
        <div className="card divide-y divide-slate-100 shadow-sm">
          {data.map((item) => (
            <div key={item.user_id} className="flex items-center justify-between px-3 py-3">
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${item.rank <=3 ? 'bg-[#f0e9ff] text-primary font-semibold' : 'bg-gray-100 text-gray-600'}`}>#{item.rank}</span>
                <div>
                  <div className={`text-sm ${item.is_me ? 'text-primary font-semibold' : 'text-gray-800'}`}>{item.name}</div>
                  <div className="text-xs text-gray-500">{item.department_name}</div>
                </div>
              </div>
              <div className="text-right text-xs text-gray-600 w-28 flex flex-col gap-1">
                <div className="flex items-center gap-1 justify-end"><Icon name="star" size={14} weight="fill" className="text-[#f59e0b]" /> {item.total_score}</div>
                <div className="flex items-center gap-1 justify-end"><Icon name="clock" size={14} weight="bold" /> {(item.best_duration_ms / 1000).toFixed(0)}s</div>
                <ProgressMini percent={Math.min(100, (item.total_score / 2000) * 100)} />
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-500">更新于 {updatedAt}</div>
      </div>
    </Page>
  );
});
