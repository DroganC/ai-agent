import { ReactNode } from 'react';

export const TagPill = ({ children, active = false, icon }: { children: ReactNode; active?: boolean; icon?: ReactNode }) => (
  <span
    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
      active ? 'bg-[#f0e9ff] text-primary font-semibold shadow-sm' : 'bg-[#f1f2f6] text-gray-700'
    }`}
  >
    {icon}
    {children}
  </span>
);
