import type { ReactNode } from 'react';

/**
 * 通关页「知识卡片」项类型，供 LevelPass 等使用。
 * 通关页整体布局已统一由 LevelResultLayout 提供（顶部大标题 + 底部吸底「返回列表」「重新游戏」）。
 */
export type PassCard = {
  id: string;
  title: string;
  description?: string;
  media?: ReactNode;
};

/**
 * @deprecated 请使用 LevelResultLayout + 自定义内容。本组件仅保留 PassCard 类型导出。
 */
export type LevelPassViewProps = {
  title: string;
  subtitle?: string;
  cards?: readonly PassCard[];
  onBackToLevels: () => void;
  onReplay: () => void;
};

