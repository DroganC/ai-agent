export const ProgressBar = ({ percent }: { percent: number }) => (
  <div className="w-full h-2 rounded-full bg-[#e6e7ec] overflow-hidden">
    <div
      className="h-full rounded-full bg-primary transition-all"
      style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
    />
  </div>
);
