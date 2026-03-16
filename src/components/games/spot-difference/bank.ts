import type { SpotDifferenceLevelConfig } from './types';

/**
 * 大家来找茬：首版内置关卡（可按 level.name / level.id 映射）
 * 后续可改为后端下发 imageTop、imageBottom、differences
 */
export const SPOT_DIFFERENCE_LEVELS: readonly SpotDifferenceLevelConfig[] = [
  {
    id: 'demo-fire-safety',
    name: '大家来找茬',
    // 首版用占位图；替换为真实找茬图后可放 spot-difference/assets/ 或 CDN
    imageTop: 'https://dummyimage.com/400x300/1a1a2e/eee&text=上图',
    imageBottom: 'https://dummyimage.com/400x300/16213e/eee&text=下图',
    totalSeconds: 120,
    maxWrongClicks: 10,
    allowHint: false,
    differences: [
      { id: 'diff-1', top: { x: 0.15, y: 0.2, w: 0.12, h: 0.1 }, bottom: { x: 0.15, y: 0.2, w: 0.12, h: 0.1 }, knowledgePoint: '差异一' },
      { id: 'diff-2', top: { x: 0.5, y: 0.45, w: 0.12, h: 0.1 }, bottom: { x: 0.5, y: 0.45, w: 0.12, h: 0.1 }, knowledgePoint: '差异二' },
      { id: 'diff-3', top: { x: 0.7, y: 0.7, w: 0.12, h: 0.1 }, bottom: { x: 0.7, y: 0.7, w: 0.12, h: 0.1 }, knowledgePoint: '差异三' },
    ],
  },
];

export function pickDefaultLevelConfig(levelName?: string, levelId?: number): SpotDifferenceLevelConfig {
  if (levelName) {
    const byName = SPOT_DIFFERENCE_LEVELS.find((c) => levelName.includes(c.name));
    if (byName) return byName;
  }
  if (levelId != null) {
    const byId = SPOT_DIFFERENCE_LEVELS.find((c) => c.id === `level-${levelId}`);
    if (byId) return byId;
  }
  return SPOT_DIFFERENCE_LEVELS[0]!;
}
