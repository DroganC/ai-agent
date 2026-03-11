import type { LearningCategory } from '../../../types/api';
import { TagPill } from '../../../components/common/TagPill';

export type CategoryFilterRowProps = {
  /** 分类列表 */
  categories: LearningCategory[];
  /** 当前选中的分类 id，null 表示「全部」 */
  activeCategoryId: number | null;
  /** 点击「全部」时回调 */
  onSelectAll: () => void;
  /** 点击某一分类时回调 */
  onSelectCategory: (id: number) => void;
};

/**
 * 学习中心 - 分类筛选：横向滚动的分类 Tag，含「全部」
 */
export function CategoryFilterRow({
  categories,
  activeCategoryId,
  onSelectAll,
  onSelectCategory,
}: CategoryFilterRowProps) {
  return (
    <div>
      <div className="sectionCard">
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            overflowX: 'auto',
            paddingBottom: 'var(--space-1)',
          }}
        >
          <span onClick={onSelectAll} style={{ flex: '0 0 auto', cursor: 'pointer' }} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onSelectAll()} aria-pressed={activeCategoryId === null}>
            <TagPill active={activeCategoryId === null}>全部</TagPill>
          </span>
          {categories.map((c) => (
            <span
              key={c.id}
              onClick={() => onSelectCategory(c.id)}
              style={{ flex: '0 0 auto', cursor: 'pointer' }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelectCategory(c.id)}
              aria-pressed={activeCategoryId === c.id}
            >
              <TagPill active={activeCategoryId === c.id}>{c.name}</TagPill>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
