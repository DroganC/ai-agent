import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { PageShell } from "../components/PageShell";
import { useApp } from "../context/AppContext";
import { formatDateTime } from "../utils/helpers";

export const OrderDetailPage = () => {
  const { orderId } = useParams();
  const { state } = useApp();

  const order = useMemo(() => state.shopOrders.find((item) => item.id === orderId), [orderId, state.shopOrders]);
  const item = useMemo(() => state.shopItems.find((it) => it.id === order?.itemId), [order?.itemId, state.shopItems]);

  if (!order || !item) {
    return (
      <PageShell title="订单详情" showBack backTo="/store/orders">
        <div className="state-block error">订单不存在</div>
      </PageShell>
    );
  }

  return (
    <PageShell title="订单详情" showBack backTo="/store/orders">
      <div className="section-card">
        <header className="section-header">
          <h3>{item.name}</h3>
          <span className="tag">{order.status}</span>
        </header>
        <p className="muted">订单号：{order.id}</p>
        <p className="muted">兑换积分：{order.costPoints}</p>
        <p className="muted">下单时间：{formatDateTime(order.createdAt)}</p>
        <p className="muted">履约信息：{order.fulfillInfo ?? "处理中"}</p>
      </div>

      {order.receiverInfo ? (
        <div className="section-card">
          <header className="section-header">
            <h3>收货信息</h3>
          </header>
          <p className="muted">收货人：{order.receiverInfo.receiverName}</p>
          <p className="muted">手机号：{order.receiverInfo.phone}</p>
          <p className="muted">地址：{order.receiverInfo.address}</p>
        </div>
      ) : null}
    </PageShell>
  );
};
