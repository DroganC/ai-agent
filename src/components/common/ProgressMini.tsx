type ProgressMiniProps = {
  percent: number;
};

export const ProgressMini = ({ percent }: ProgressMiniProps) => {
  // Clamp at render layer to keep upstream data usage simple.
  const safePercent = Math.min(100, Math.max(0, percent));

  return (
    <div style={{ width: '100%', height: 6, borderRadius: 999, background: '#e6e7ec', overflow: 'hidden' }}>
      <div
        style={{
          height: '100%',
          width: `${safePercent}%`,
          borderRadius: 999,
          background: 'var(--adm-color-primary)',
          transition: 'width 200ms ease',
        }}
      />
    </div>
  );
};
