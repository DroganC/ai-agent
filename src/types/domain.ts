export type AttemptStatus = "in_progress" | "passed" | "failed" | "aborted";

export type ErrorType = "mis_touch" | "missed_step" | "wrong_order" | "timeout" | "other";

export type ReviveType = "points" | "task";

export interface UserProfile {
  id: number;
  comeUserId: string;
  employeeNo: string;
  name: string;
  jobTitle: string;
  jobLevel: string;
  departmentId: string;
  departmentName: string;
  baseId: string;
  baseName: string;
  avatarColor: string;
}

export interface Scene {
  id: number;
  code: string;
  name: string;
  subtitle: string;
  coverUrl: string;
  status: 0 | 1;
}

export interface LevelModule {
  id: number;
  sceneId: number;
  name: string;
  orderNo: number;
  status: 0 | 1;
}

export interface LevelPassRule {
  minScore: number;
  timeoutMs: number;
  keyErrorFail: boolean;
  nonKeyPenalty: Record<ErrorType, number>;
}

export interface StepOption {
  id: string;
  label: string;
  isCorrect: boolean;
  errorType?: ErrorType;
  isKeyError?: boolean;
  tip: string;
}

export interface LevelStep {
  id: string;
  title: string;
  description: string;
  knowledgePoint: string;
  options: StepOption[];
}

export interface Level {
  id: number;
  moduleId: number;
  name: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  unlockPrevLevelId?: number;
  estimatedSeconds: number;
  rewardPoints: number;
  passRule: LevelPassRule;
  contentVersion: string;
  status: 0 | 1 | 2;
  knowledgePoints: string[];
  steps: LevelStep[];
}

export interface AttemptEvent {
  id: string;
  attemptId: string;
  eventType: "step_ok" | "step_error" | "attempt_start" | "attempt_finish";
  stepId?: string;
  knowledgePoint?: string;
  errorType?: ErrorType;
  isKeyError: boolean;
  ts: string;
  message: string;
}

export interface LevelAttempt {
  id: string;
  userId: number;
  levelId: number;
  status: AttemptStatus;
  startAt: string;
  endAt?: string;
  durationMs?: number;
  score?: number;
  failReason?: "timeout" | "key_error" | "manual_abort" | "other";
  errorCount: number;
  keyErrorCount: number;
  clientMode: "normal" | "light";
  contentVersion: string;
  events: AttemptEvent[];
}

export interface UserLevelProgress {
  userId: number;
  levelId: number;
  unlockStatus: 0 | 1;
  passCount: number;
  bestScore: number;
  bestDurationMs?: number;
  reachedAt?: string;
  lastAttemptId?: string;
  updatedAt: string;
}

export interface UserLifeAccount {
  userId: number;
  lifeCount: number;
  dailyResetDate: string;
  updatedAt: string;
}

export interface UserLifeFlow {
  id: string;
  userId: number;
  change: number;
  reason: "fail" | "revive" | "task" | "reset" | "admin_adjust";
  refType?: "attempt" | "revive" | "system";
  refId?: string;
  createdAt: string;
}

export interface UserReviveCounter {
  userId: number;
  date: string;
  reviveCount: number;
  maxPerDay: number;
  updatedAt: string;
}

export interface UserPointAccount {
  userId: number;
  balance: number;
  updatedAt: string;
}

export interface UserPointFlow {
  id: string;
  userId: number;
  change: number;
  balanceAfter: number;
  reason:
    | "level_pass"
    | "first_pass"
    | "revive"
    | "redeem"
    | "learning_complete"
    | "admin_adjust";
  refType?: "attempt" | "store_order" | "material" | "revive";
  refId?: string;
  createdAt: string;
}

export interface LearningCategory {
  id: number;
  parentId?: number;
  name: string;
  orderNo: number;
}

export type LearningMaterialType = "doc" | "video" | "image" | "link";

export interface LearningMaterial {
  id: number;
  title: string;
  type: LearningMaterialType;
  categoryId: number;
  tags: string[];
  summary: string;
  url: string;
  status: 0 | 1 | 2 | 3;
  durationHint: string;
}

export type LearningRecordStatus = "viewed" | "completed";

export interface LearningRecord {
  id: string;
  userId: number;
  materialId: number;
  status: LearningRecordStatus;
  durationMs: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShopItem {
  id: number;
  name: string;
  type: "virtual" | "physical";
  costPoints: number;
  stock: number;
  status: 0 | 1;
  limitPerDay: number;
  cover: string;
  description: string;
}

export interface ReceiverInfo {
  receiverName: string;
  phone: string;
  address: string;
}

export interface ShopOrder {
  id: string;
  userId: number;
  itemId: number;
  status: "created" | "paid" | "fulfilled" | "cancelled" | "refunded";
  costPoints: number;
  receiverInfo?: ReceiverInfo;
  fulfillInfo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  userId: number;
  userName: string;
  departmentName: string;
  baseName: string;
  totalScore: number;
  bestDurationMs: number;
  achievedAt: string;
}

export interface ReviveTaskProgress {
  learningCompleted: boolean;
  reviewCompleted: boolean;
  claimedTaskIds: string[];
  date: string;
}

export interface AnalyticsEvent {
  id: string;
  event: string;
  ts: string;
  payload: Record<string, unknown>;
}

export interface UserComputedStats {
  totalScore: number;
  bestDurationMs: number;
  passLevelCount: number;
  unlockedLevelCount: number;
  lastAttemptId?: string;
}

export interface AppState {
  sessionToken: string | null;
  currentUser: UserProfile | null;
  scenes: Scene[];
  modules: LevelModule[];
  levels: Level[];
  selectedSceneId: number;
  progressByLevel: Record<number, UserLevelProgress>;
  attemptsById: Record<string, LevelAttempt>;
  attemptOrder: string[];
  lifeAccount: UserLifeAccount;
  lifeFlows: UserLifeFlow[];
  reviveCounter: UserReviveCounter;
  reviveTasks: ReviveTaskProgress;
  pointAccount: UserPointAccount;
  pointFlows: UserPointFlow[];
  learningCategories: LearningCategory[];
  learningMaterials: LearningMaterial[];
  learningRecords: LearningRecord[];
  shopItems: ShopItem[];
  shopOrders: ShopOrder[];
  leaderboardPeers: LeaderboardEntry[];
  analyticsEvents: AnalyticsEvent[];
  lastLeaderboardRefreshAt: string;
}

export interface ApiMeta {
  requestId: string;
  total?: number;
  limit?: number;
  offset?: number;
}

export interface ApiSuccess<T> {
  data: T;
  meta: ApiMeta;
}

export interface ApiFailure {
  error: {
    code: string;
    message: string;
  };
  meta: ApiMeta;
}
