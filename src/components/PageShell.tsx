import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type BottomTab = {
  to: string;
  label: string;
  icon: string;
};

const tabs: BottomTab[] = [
  { to: "/lobby", label: "大厅", icon: "🏠" },
  { to: "/leaderboard", label: "榜单", icon: "🏆" },
  { to: "/store", label: "商城", icon: "🛍️" },
  { to: "/learning", label: "学习", icon: "📚" },
  { to: "/profile", label: "我的", icon: "👤" },
];

type PageShellProps = {
  title: string;
  children: ReactNode;
  showBack?: boolean;
  backTo?: string;
  rightSlot?: ReactNode;
  showTabBar?: boolean;
};

export const PageShell = ({
  title,
  children,
  showBack = false,
  backTo,
  rightSlot,
  showTabBar = false,
}: PageShellProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    // 移动端固定宽度容器，确保 H5 在企业容器与浏览器中显示一致。
    <div className="mobile-shell">
      <header className="top-header">
        <div className="top-header-left">
          {showBack ? (
            <button
              className="icon-btn"
              type="button"
              onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
            >
              ←
            </button>
          ) : (
            <span className="placeholder-icon" />
          )}
        </div>
        <h1 className="top-title">{title}</h1>
        <div className="top-header-right">{rightSlot}</div>
      </header>

      <main className={`page-main ${showTabBar ? "with-tab-bar" : ""}`}>{children}</main>

      {showTabBar && (
        <nav className="tab-bar">
          {tabs.map((tab) => {
            const active = location.pathname === tab.to || location.pathname.startsWith(`${tab.to}/`);
            return (
              <button
                type="button"
                className={`tab-item ${active ? "active" : ""}`}
                key={tab.to}
                onClick={() => navigate(tab.to)}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};
