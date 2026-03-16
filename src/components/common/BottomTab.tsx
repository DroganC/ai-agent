import { observer } from 'mobx-react-lite';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon, type IconKey } from '../../icons';
import type { TabKey } from '../../types/api';
import { TabBar } from 'antd-mobile';
import { useStores } from '../../stores';

const tabs = [
  { key: '/home', label: '首页', icon: 'home' },
  { key: '/rank', label: '排行榜', icon: 'analytics' },
  { key: '/me', label: '我的', icon: 'profile' },
] as const satisfies ReadonlyArray<{ key: TabKey; label: string; icon: IconKey }>;

export const BottomTab = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { uiStore } = useStores();
  const active = location.pathname.startsWith('/rank')
    ? '/rank'
    : location.pathname.startsWith('/me')
    ? '/me'
    : location.pathname.startsWith('/home')
    ? '/home'
    : uiStore.tab || '/home';

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        background: 'var(--color-card)',
        borderTop: 'var(--hairline)',
        boxShadow: '0 -4px 12px rgba(17, 24, 39, 0.06)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <TabBar
        activeKey={active}
        onChange={(key) => {
          const next = key as TabKey;
          uiStore.setTab(next);
          navigate(next, { replace: true });
        }}
        style={{ '--adm-tab-bar-height': 'var(--tabbar-height)' } as never}
      >
        {tabs.map((tab) => (
          <TabBar.Item
            key={tab.key}
            icon={(active) => <Icon name={tab.icon} size={22} weight={active ? 'fill' : 'bold'} />}
            title={tab.label}
          />
        ))}
      </TabBar>
    </div>
  );
});
