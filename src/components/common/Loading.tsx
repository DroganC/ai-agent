import { DotLoading } from 'antd-mobile';

export const Loading = ({ text = '加载中' }: { text?: string }) => (
  <div style={{ width: '100%', padding: '48px 0', textAlign: 'center', color: 'var(--adm-color-primary)', fontSize: 14 }}>
    <span style={{ marginRight: 8 }}>{text}</span>
    <DotLoading />
  </div>
);
