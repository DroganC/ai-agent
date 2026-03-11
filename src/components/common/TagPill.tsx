import { ReactNode } from 'react';
import { Tag } from 'antd-mobile';

export const TagPill = ({ children, active = false, icon }: { children: ReactNode; active?: boolean; icon?: ReactNode }) => (
  <Tag
    color="primary"
    fill={active ? 'solid' : 'outline'}
    style={{ borderRadius: 999, padding: '6px 12px', fontSize: 13, display: 'inline-flex', gap: 6, alignItems: 'center' }}
  >
    {icon}
    {children}
  </Tag>
);
