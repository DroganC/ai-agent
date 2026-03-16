/**
 * 大家来找茬：类型定义（移动端上下两图）
 */

/** 单处差异区域，比例 [0,1]：左、上、宽、高 */
export type DifferenceRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type DifferenceRegion = {
  /** 唯一标识，用于 step_id 上报 */
  id: string;
  /** 上图上的区域 */
  top: DifferenceRect;
  /** 下图上的区域 */
  bottom: DifferenceRect;
  /** 找对后展示的知识点/说明 */
  knowledgePoint?: string;
  isKey?: boolean;
};

export type SpotDifferenceLevelConfig = {
  id: string;
  name: string;
  /** 上图 URL 或静态资源路径 */
  imageTop: string;
  /** 下图 URL 或静态资源路径 */
  imageBottom: string;
  differences: readonly DifferenceRegion[];
  totalSeconds?: number;
  maxWrongClicks?: number;
  allowHint?: boolean;
};

export type SpotDifferenceRunSummary = {
  levelId: string;
  total: number;
  found: number;
  wrongClicks: number;
  durationMs: number;
  score: number;
  status: 'passed' | 'failed' | 'aborted';
  failReason?: 'timeout' | 'other' | 'manual_abort';
};
