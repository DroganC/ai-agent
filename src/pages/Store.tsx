import { useEffect, useState } from 'react';
import { createOrder, fetchItems } from '../services/store';
import { StoreItem } from '../types/api';
import { Page } from '../components/common/Page';
import { Loading } from '../components/common/Loading';
import { ErrorView } from '../components/common/ErrorView';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../icons';
import { getErrorMessage } from '../utils/error';

export const Store = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ordering, setOrdering] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetchItems();
      setItems(res);
      setError(null);
    } catch (e: unknown) {
      setError(getErrorMessage(e, '加载失败'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleOrder = async (itemId: number) => {
    try {
      setOrdering(true);
      await createOrder(itemId);
      await load();
      alert('兑换成功');
    } catch (e: unknown) {
      alert(getErrorMessage(e, '兑换失败'));
    } finally {
      setOrdering(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  return (
    <Page>
      <div className="mt-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-[#1f1f3d]">积分商城</div>
          <button className="px-3 py-2 rounded-full bg-primary text-white text-sm shadow-sm flex items-center gap-1" onClick={() => navigate('/store/orders')}>
            <Icon name="bag" size={16} weight="bold" />
            兑换记录
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <div key={item.id} className="p-3 rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-sm text-[#1f1f3d]">{item.name}</div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Icon name="star" size={14} weight="fill" className="text-[#f59e0b]" /> 积分 {item.cost_points}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Icon name="pkg" size={14} weight="bold" /> 库存 {item.stock}
                  </div>
                </div>
                <Icon name="bag" size={20} weight="bold" className="text-primary" />
              </div>
              <button
                className={`mt-3 w-full py-2 rounded-full text-sm ${item.stock > 0 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}
                disabled={item.stock <= 0 || ordering}
                onClick={() => handleOrder(item.id)}
              >
                兑换
              </button>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
};
