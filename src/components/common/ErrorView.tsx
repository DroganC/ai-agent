export const ErrorView = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div className="w-full py-8 text-center text-red-500">
    <div className="mb-3">{message}</div>
    {onRetry && (
      <button className="px-4 py-2 rounded bg-primary text-white" onClick={onRetry}>
        重试
      </button>
    )}
  </div>
);
