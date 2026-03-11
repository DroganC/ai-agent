import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { useStores } from '../../stores';
import { Page } from '../../components/common/Page';
import { Loading } from '../../components/common/Loading';
import { ErrorView } from '../../components/common/ErrorView';
import { PageHeader } from '../../components/common/PageHeader';
import { OrderListItem } from './components/OrderListItem';

/**
 * 兑换记录页
 * 展示当前用户积分兑换订单列表；状态由 storeOrdersStore 统一管理
 */
export const StoreOrders = observer(function StoreOrders() {
  const navigate = useNavigate();
  const { storeOrdersStore } = useStores();

  useEffect(() => {
    void storeOrdersStore.load();
  }, [storeOrdersStore]);

  if (storeOrdersStore.loading) return <Loading />;
  if (storeOrdersStore.error) return <ErrorView message={storeOrdersStore.error} onRetry={() => void storeOrdersStore.load()} />;

  return (
    <Page showTab={false}>
      <div className="screen">
        <div className="stack" style={{ gap: 'var(--space-3)' }}>
          <PageHeader
            title="兑换记录"
            subtitle="查看积分兑换历史"
            onBack={() => navigate(-1)}
          />

          <div className="sectionCard">
            <ul className="sectionCardList">
              {storeOrdersStore.orders.map((o) => (
                <OrderListItem key={o.id} order={o} />
              ))}
              {storeOrdersStore.orders.length === 0 && (
                <li className="sectionCardList__item">
                  <span className="subtle">暂无兑换记录</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </Page>
  );
});
