import { useNavigate } from "react-router-dom";
import { PageShell } from "../components/PageShell";
import { useApp } from "../context/AppContext";
import { formatDateTime } from "../utils/helpers";

export const OrdersPage = () => {
  const { state } = useApp();
  const navigate = useNavigate();

  return (
    <PageShell title="我的订单" showBack backTo="/store">
      <div className="level-list">
        {state.shopOrders.length === 0 ? (
          <div className="state-block">暂无订单，先去商城兑换奖励吧。</div>
        ) : null}
        {state.shopOrders.map((order) => {
          const item = state.shopItems.find((it) => it.id === order.itemId);
          return (
            <article key={order.id} className="level-card">
              <div className="level-header">
                <h3>{item?.name ?? "未知商品"}</h3>
                <span className="tag">{order.status}</span>
              </div>
              <p className="muted">订单号：{order.id}</p>
              <p className="muted">积分：-{order.costPoints}</p>
              <p className="muted">下单时间：{formatDateTime(order.createdAt)}</p>
              <button
                type="button"
                className="ghost-btn block-btn"
                onClick={() => navigate(`/store/orders/${order.id}`)}
              >
                查看详情
              </button>
            </article>
          );
        })}
      </div>
    </PageShell>
  );
};
