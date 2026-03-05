type ProgressMiniProps = {
  percent: number;
};

export const ProgressMini = ({ percent }: ProgressMiniProps) => {
  // Clamp at render layer to keep upstream data usage simple.
  const safePercent = Math.min(100, Math.max(0, percent));

  return (
    <div className="w-full h-1.5 rounded-full bg-[#e6e7ec] overflow-hidden">
      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${safePercent}%` }} />
    </div>
  );
};
