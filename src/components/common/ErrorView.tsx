import { ErrorBlock } from 'antd-mobile';
import { Button } from './Button';

export const ErrorView = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div style={{ width: '100%', padding: '24px 0' }}>
    <ErrorBlock status="default" title="出错了" description={message} />
    {onRetry && (
      <div style={{ padding: '0 16px', marginTop: 12 }}>
        <Button full onClick={onRetry}>
          重试
        </Button>
      </div>
    )}
  </div>
);
