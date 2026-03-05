import { observer } from 'mobx-react-lite';
import { useNavigate, useLocation } from 'react-router-dom';
import { uiStore } from '../../store';
import { Icon, type IconKey } from '../../icons';
import type { TabKey } from '../../types/api';

const tabs = [
  { key: '/hall', label: '首页', icon: 'home' },
  { key: '/leaderboard', label: '排行榜', icon: 'leaderboard' },
  { key: '/profile', label: '我的', icon: 'profile' },
] as const satisfies ReadonlyArray<{ key: TabKey; label: string; icon: IconKey }>;

export const BottomTab = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname.startsWith('/leaderboard')
    ? '/leaderboard'
    : location.pathname.startsWith('/profile')
    ? '/profile'
    : location.pathname.startsWith('/hall')
    ? '/hall'
    : uiStore.tab || '/hall';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-14 flex items-center justify-around bg-white/95 backdrop-blur border-t border-slate-200 px-3">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition ${
              isActive ? 'bg-[#f0e9ff] text-primary font-semibold' : 'text-gray-500'
            }`}
            onClick={() => {
              uiStore.setTab(tab.key);
              navigate(tab.key);
            }}
          >
            <Icon name={tab.icon} size={18} weight={isActive ? 'fill' : 'bold'} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
});
