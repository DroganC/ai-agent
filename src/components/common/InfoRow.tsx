import { ReactNode } from 'react';

export const InfoRow = ({ label, value, icon }: { label: ReactNode; value?: ReactNode; icon?: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: '#4b5563' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280' }}>
      {icon}
      <span>{label}</span>
    </div>
    {value && <div style={{ color: '#111827' }}>{value}</div>}
  </div>
);
