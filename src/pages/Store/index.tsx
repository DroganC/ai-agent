import { useEffect, useState, useCallback } from 'react';
import { createOrder, fetchItems } from '../../services/store';
import type { StoreItem } from '../../types/api';
import { Page } from '../../components/common/Page';
import { Loading } from '../../components/common/Loading';
import { ErrorView } from '../../components/common/ErrorView';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../icons';
import { getErrorMessage } from '../../utils/error';
import { Card, Grid, Toast } from 'antd-mobile';
import { Button } from '../../components/common/Button';

/**
 * 积分商城页
 * 展示商品列表，点击兑换后调用 createOrder 并刷新列表
 */
export function Store() {
  const navigate = useNavigate();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ordering, setOrdering] = useState<boolean>(false);

  /** 拉取商品列表 */
  const load = useCallback(async (): Promise<void> => {
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
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** 兑换商品：创建订单后刷新列表并 Toast */
  const handleOrder = useCallback(
    async (itemId: number): Promise<void> => {
      try {
        setOrdering(true);
        await createOrder(itemId);
        await load();
        Toast.show({ content: '兑换成功', duration: 1200 });
      } catch (e: unknown) {
        Toast.show({ content: getErrorMessage(e, '兑换失败'), duration: 1600 });
      } finally {
        setOrdering(false);
      }
    },
    [load]
  );

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  return (
    <Page showTab={false}>
      <div className="screen">
        <div className="stack">
          <div className="row">
            <button
              type="button"
              className="actionPill"
              onClick={() => navigate(-1)}
              style={{ padding: 0, width: '0.84rem', height: '0.84rem', justifyContent: 'center' }}
              aria-label="返回"
            >
              <span style={{ display: 'inline-flex', transform: 'rotate(180deg)' }}>
                <Icon name="caretRight" size={18} weight="bold" />
              </span>
            </button>
            <div style={{ flex: 1 }}>
              <div className="title">积分商城</div>
              <div className="subtle">使用积分兑换奖励（示例）</div>
            </div>
            <button type="button" className="actionPill" onClick={() => navigate('/store/orders')} aria-label="查看兑换记录">
              <Icon name="bag" size={18} weight="bold" />
              <span className="actionPillText">记录</span>
            </button>
          </div>

          <div>
            <div className="sectionTitle">商品列表</div>
            <div className="subtle" style={{ marginBottom: 'var(--space-2)' }}>
              兑换后将扣减积分并生成记录
            </div>
          </div>

          <Grid columns={2} gap={12}>
            {items.map((item) => (
              <Grid.Item key={item.id}>
                <Card style={{ borderRadius: 'var(--radius-card)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 900,
                            fontSize: 'var(--font-body)',
                            color: 'var(--color-text)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.name}
                        </div>
                        <div className="subtle" style={{ marginTop: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <Icon name="star" size={14} weight="fill" /> {item.cost_points} 积分
                        </div>
                        <div className="subtle" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <Icon name="pkg" size={14} weight="bold" /> 库存 {item.stock}
                        </div>
                      </div>
                    </div>
                    <Button full variant="primary" disabled={ordering || item.stock <= 0} onClick={() => void handleOrder(item.id)}>
                      兑换
                    </Button>
                  </div>
                </Card>
              </Grid.Item>
            ))}
          </Grid>
        </div>
      </div>
    </Page>
  );
}
