import { Icon, type IconKey } from '../../../icons';

export type QuickEntryItem = {
  label: string;
  icon: IconKey;
  to: string;
};

export type QuickEntryGridProps = {
  /** 快捷入口配置列表 */
  entries: QuickEntryItem[];
  /** 点击某一项时跳转 */
  onNavigate: (path: string) => void;
};

/**
 * 个人主页快捷入口网格
 * flex + 百分比布局，一行固定 5 个
 */
export function QuickEntryGrid({ entries, onNavigate }: QuickEntryGridProps) {
  return (
    <div
      className="quick-entries"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-2)',
      }}
    >
      {entries.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => onNavigate(item.to)}
          className="quick-entry-item"
          style={{
            flex: '0 0 calc((100% - 4 * var(--space-2)) / 5)',
            aspectRatio: '1',
            padding: 'var(--space-1)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-bg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-1)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-line)',
          }}
        >
          <Icon name={item.icon} size={18} weight="bold" />
          <span style={{ fontSize: 'var(--font-caption)', fontWeight: 800, lineHeight: 1.2 }}>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
