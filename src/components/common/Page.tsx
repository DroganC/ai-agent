import { ReactNode } from 'react';
import { BottomTab } from './BottomTab';
import { SafeArea } from 'antd-mobile';

export const Page = ({ children, showTab = true }: { children: ReactNode; showTab?: boolean }) => (
  <div
    className="page"
    style={{
      minHeight: '100vh',
      paddingBottom: showTab
        ? 'calc(var(--tabbar-height) + var(--space-4) + env(safe-area-inset-bottom))'
        : 0,
    }}
  >
    <div style={{ flex: 1, padding: 0 }}>{children}</div>
    {showTab && <BottomTab />}
    <SafeArea position="bottom" />
  </div>
);
