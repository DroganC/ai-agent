import { ProgressBar as AMProgressBar } from 'antd-mobile';

export const ProgressBar = ({ percent }: { percent: number }) => (
  <AMProgressBar percent={Math.min(100, Math.max(0, percent))} />
);
