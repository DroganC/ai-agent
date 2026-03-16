export type Category = {
  /** 稳定 id，用于题目引用 */
  id: 'left' | 'right';
  /** 展示给用户的标签 */
  label: string;
  /** 角标/图标（可选；首版先用 emoji 文案即可） */
  badge?: string;
};

export type ClassifyQuestion = {
  id: string;
  /** 题面主文案 */
  title: string;
  /** 可选副标题（场景补充） */
  subtitle?: string;
  /** 正确分类 */
  correctCategoryId: Category['id'];
  /** 解释：用于做对/做错后的“为什么”反馈 */
  explain: string;
  /** 知识点：用于 attempt 事件或复盘 */
  knowledgePoint?: string;
  /** 关键题：错误可记为 key_error */
  isKey?: boolean;
};

export type ClassifyLevelConfig = {
  id: string;
  name: string;
  /** 左/右两个分类（适配 swipe 交互） */
  categories: readonly [Category, Category];
  /** 本关题目池（进入时可按规则抽取/洗牌） */
  questions: readonly ClassifyQuestion[];
  /** 本关出题数量（<= questions.length）；不填则用全部 */
  takeCount?: number;
  /** 单题限时（秒）；不填则不限时 */
  perQuestionSeconds?: number;
  /** 允许的普通错误次数；超过则失败 */
  maxErrors?: number;
  /** 允许的关键错误次数；超过则失败 */
  maxKeyErrors?: number;
};

export type ClassifyRunSummary = {
  levelId: string;
  total: number;
  correct: number;
  errors: number;
  keyErrors: number;
  durationMs: number;
  score: number;
  status: 'passed' | 'failed' | 'aborted';
  failReason?: 'timeout' | 'key_error' | 'too_many_errors' | 'manual_abort' | 'other';
};

