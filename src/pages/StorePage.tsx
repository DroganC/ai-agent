import { useNavigate } from "react-router-dom";
import { PageShell } from "../components/PageShell";
import { useApp } from "../context/AppContext";

export const StorePage = () => {
  const { state } = useApp();
  const navigate = useNavigate();

  return (
    <PageShell
      title="积分商城"
      showTabBar
      rightSlot={
        <button type="button" className="mini-btn" onClick={() => navigate("/store/orders")}>
          我的订单
        </button>
      }
    >
      <p className="scene-tip">当前积分：{state.pointAccount.balance}</p>

      <div className="level-list">
        {state.shopItems
          .filter((item) => item.status === 1)
          .map((item) => (
            <article className="level-card" key={item.id}>
              <div className="level-header">
                <h3>
                  {item.cover} {item.name}
                </h3>
                <span className="tag">{item.type === "virtual" ? "虚拟" : "实物"}</span>
              </div>
              <p className="muted">{item.description}</p>
              <p className="muted">
                消耗 {item.costPoints} 积分 ｜ 库存 {item.stock} ｜ 限购 {item.limitPerDay}/天
              </p>
              <button
                type="button"
                className="primary-btn block-btn"
                onClick={() => navigate(`/store/item/${item.id}`)}
              >
                查看详情
              </button>
            </article>
          ))}
      </div>
    </PageShell>
  );
};
