import type { LearningMaterial } from '../../../types/api';
import { Button } from '../../../components/common/Button';

export type MaterialListItemProps = {
  /** 学习材料数据 */
  material: LearningMaterial;
  /** 点击「完成」时回调 */
  onMarkDone: (id: number) => void;
};

/**
 * 学习材料列表单项：标题、类型、完成按钮
 */
export function MaterialListItem({ material, onMarkDone }: MaterialListItemProps) {
  return (
    <li className="sectionCardList__item">
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 900, color: 'var(--color-text)', fontSize: 'var(--font-body)' }}>
          {material.title}
        </div>
        <div className="subtle" style={{ marginTop: 'var(--space-1)' }}>
          类型：{material.type}
        </div>
      </div>
      <div style={{ flex: '0 0 auto' }}>
        <Button variant="primary" onClick={() => onMarkDone(material.id)}>
          完成
        </Button>
      </div>
    </li>
  );
}
