import type { StoreOrder } from '../../../types/api';
import { Icon } from '../../../icons';

export type OrderListItemProps = {
  /** 订单数据 */
  order: StoreOrder;
};

/**
 * 兑换记录列表单项：订单 id、积分、状态
 */
export function OrderListItem({ order }: OrderListItemProps) {
  return (
    <li className="sectionCardList__item">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          flex: 1,
          minWidth: 0,
        }}
      >
        <span style={{ flex: '0 0 auto' }}>
          <Icon name="pkg" size={16} weight="bold" />
        </span>
        <span style={{ fontWeight: 900, color: 'var(--color-text)', fontSize: 'var(--font-body)' }}>
          订单 {order.id}
        </span>
      </div>
      <span
        className="subtle"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          fontWeight: 800,
          flex: '0 0 auto',
        }}
      >
        <Icon name="bag" size={14} weight="bold" />
        {order.cost_points} 分 · {order.status}
      </span>
    </li>
  );
}
