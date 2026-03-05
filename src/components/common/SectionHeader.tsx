import { ReactNode } from 'react';

export const SectionHeader = ({ title, action }: { title: ReactNode; action?: ReactNode }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="text-base font-semibold text-[#1f1f3d]">{title}</div>
    {action}
  </div>
);
