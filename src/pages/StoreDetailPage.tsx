import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageShell } from "../components/PageShell";
import { useApp } from "../context/AppContext";

export const StoreDetailPage = () => {
  const { itemId: itemIdParam } = useParams();
  const itemId = Number(itemIdParam);
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const item = useMemo(() => state.shopItems.find((it) => it.id === itemId), [state.shopItems, itemId]);

  const onRedeem = async () => {
    if (!item) return;
    try {
      setBusy(true);
      setMessage("");
      const orderId = await actions.redeemItem(
        item.id,
        item.type === "physical"
          ? {
              receiverName,
              phone,
              address,
            }
          : undefined,
      );
      setMessage("兑换成功，正在跳转订单详情...");
      setTimeout(() => navigate(`/store/orders/${orderId}`), 500);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "兑换失败");
    } finally {
      setBusy(false);
    }
  };

  if (!item) {
    return (
      <PageShell title="商品详情" showBack backTo="/store">
        <div className="state-block error">商品不存在</div>
      </PageShell>
    );
  }

  return (
    <PageShell title="商品详情" showBack backTo="/store">
      <div className="section-card">
        <header className="section-header">
          <h3>
            {item.cover} {item.name}
          </h3>
          <span className="tag">{item.type === "virtual" ? "虚拟奖品" : "实物奖品"}</span>
        </header>
        <p className="muted">{item.description}</p>
        <p className="muted">积分消耗：{item.costPoints}</p>
        <p className="muted">剩余库存：{item.stock}</p>
        <p className="muted">当前积分：{state.pointAccount.balance}</p>
      </div>

      {item.type === "physical" ? (
        <div className="section-card">
          <header className="section-header">
            <h3>收货信息</h3>
          </header>
          <div className="form-grid">
            <input placeholder="收货人" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} />
            <input placeholder="手机号" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <textarea
              placeholder="详细地址"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      ) : null}

      {message ? <p className="feedback-text">{message}</p> : null}

      <button type="button" className="primary-btn block-btn" onClick={() => void onRedeem()} disabled={busy}>
        {busy ? "兑换中..." : "确认兑换"}
      </button>
    </PageShell>
  );
};
