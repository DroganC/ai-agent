import { useNavigate } from "react-router-dom";
import { PageShell } from "../components/PageShell";

export const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <PageShell title="页面不存在" showBack>
      <div className="state-block">
        <p>访问的页面不存在或已迁移。</p>
        <button type="button" className="primary-btn" onClick={() => navigate("/lobby")}>
          返回大厅
        </button>
      </div>
    </PageShell>
  );
};
