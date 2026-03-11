import { ReactNode } from 'react';

export const SectionHeader = ({ title, action }: { title: ReactNode; action?: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>{title}</div>
    {action}
  </div>
);
