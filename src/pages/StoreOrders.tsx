import { useEffect, useState } from 'react';
import { fetchOrders } from '../services/store';
import { StoreOrder } from '../types/api';
import { Page } from '../components/common/Page';
import { Loading } from '../components/common/Loading';
import { ErrorView } from '../components/common/ErrorView';
import { Icon } from '../icons';
import { getErrorMessage } from '../utils/error';

export const StoreOrders = () => {
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetchOrders();
      setOrders(res);
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
      <div className="mt-3 space-y-2">
        <div className="text-xl font-bold text-[#1f1f3d]">兑换记录</div>
        <div className="card divide-y divide-slate-100 shadow-sm">
          {orders.map((o) => (
            <div key={o.id} className="px-3 py-3 text-sm flex justify-between">
              <span className="font-medium text-gray-800 flex items-center gap-2">
                <Icon name="pkg" size={16} weight="bold" />
                订单 {o.id}
              </span>
              <span className="text-gray-600 flex items-center gap-2">
                <Icon name="bag" size={14} weight="bold" />
                {o.cost_points} 分 · {o.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
};
