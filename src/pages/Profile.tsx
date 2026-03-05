import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { authStore } from '../store';
import { fetchPointTransactions } from '../services/user';
import { fetchLife } from '../services/life';
import { logout } from '../services/auth';
import { Page } from '../components/common/Page';
import { Loading } from '../components/common/Loading';
import { ErrorView } from '../components/common/ErrorView';
import { Icon, type IconKey } from '../icons';
import type { PointTransaction } from '../types/api';
import { getErrorMessage } from '../utils/error';

export const Profile = observer(() => {
  const navigate = useNavigate();
  const [flows, setFlows] = useState<PointTransaction[]>([]);
  const [life, setLife] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const [f, l] = await Promise.all([fetchPointTransactions(), fetchLife()]);
        setFlows(f);
        setLife(l.life_count);
        setError(null);
      } catch (e: unknown) {
        setError(getErrorMessage(e, '加载失败'));
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={() => window.location.reload()} />;

  const user = authStore.user;

  const quickEntries: Array<{ label: string; icon: IconKey; to: string }> = [
    { label: '学习中心', icon: 'checklist', to: '/learning' },
    { label: '积分商城', icon: 'bag', to: '/store' },
  ];

  return (
    <Page>
      <div className="mt-3 space-y-4">
        <div className="card p-5 shadow-sm flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#f0e9ff] text-primary flex items-center justify-center text-lg font-semibold">
            {user?.name ? user.name.slice(0, 1) : 'U'}
          </div>
          <div className="flex-1">
            <div className="text-lg font-semibold text-[#1f1f3d]">{user?.name}</div>
            <div className="text-sm text-gray-500">{user?.department_name} · {user?.base_name}</div>
            <div className="mt-2 flex gap-2 text-sm">
              <span className="px-3 py-1 rounded-full bg-[#f0e9ff] text-primary">积分 {user?.points ?? 0}</span>
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600">生命 {life} / 3</span>
            </div>
          </div>
        </div>

        <div className="card p-4 shadow-sm">
          <div className="font-semibold mb-3 text-[#1f1f3d]">快捷入口</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {quickEntries.map((item) => (
              <button
                key={item.label}
                className="p-3 rounded-2xl bg-[#f6f7fb] flex flex-col items-center gap-1 text-gray-700"
                onClick={() => navigate(item.to)}
              >
                <Icon name={item.icon} size={20} weight="bold" className="text-primary" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-4 shadow-sm">
          <div className="font-semibold mb-2 text-[#1f1f3d]">积分明细</div>
          <div className="space-y-2 text-sm">
            {flows.map((f) => (
              <div key={f.id} className="flex justify-between text-gray-700">
                <span className="flex items-center gap-2">
                  <Icon name="checklist" size={14} weight="bold" className="text-gray-500" />
                  {f.reason}
                </span>
                <span className={f.change > 0 ? 'text-green-600' : 'text-red-500'}>{f.change > 0 ? `+${f.change}` : f.change}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="w-full py-3 rounded-full bg-white text-gray-700 border border-slate-200" onClick={() => { logout(); navigate('/login-callback'); }}>
          重新登录
        </button>
      </div>
    </Page>
  );
});
