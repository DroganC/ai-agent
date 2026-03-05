import { ReactNode } from 'react';

export const InfoRow = ({ label, value, icon }: { label: ReactNode; value?: ReactNode; icon?: ReactNode }) => (
  <div className="flex items-center justify-between text-sm text-gray-700">
    <div className="flex items-center gap-2 text-gray-600">
      {icon}
      <span>{label}</span>
    </div>
    {value && <div className="text-gray-800">{value}</div>}
  </div>
);
