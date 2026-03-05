import { ReactNode } from 'react';
import { BottomTab } from './BottomTab';

export const Page = ({ children, showTab = true }: { children: ReactNode; showTab?: boolean }) => (
  <div className="page min-h-screen flex flex-col pb-16">
    <div className="flex-1 px-4 pb-4">{children}</div>
    {showTab && <BottomTab />}
  </div>
);
