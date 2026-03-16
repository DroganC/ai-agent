/**
 * 统一 Mock API
 * 当 VITE_USE_MOCK 开启时，各 service 调用本模块对应方法替代真实请求。
 * 所有 mock 数据与可变状态均在此维护。
 */
import type {
  Attempt,
  AttemptEvent,
  AttemptReview,
  AttemptStatus,
  LeaderboardResponse,
  LifeInfo,
  Level,
  LevelModule,
  LearningCategory,
  LearningMaterial,
  PointTransaction,
  Scene,
  StoreItem,
  StoreOrder,
} from '../types/api';
import type { UserInfo } from '../stores/authStore';
import {
  attempts,
  leaderboard,
  learningCategories,
  learningMaterials,
  levels,
  mockUser,
  modules,
  pointTransactions,
  scenes,
  storeItems,
  storeOrders,
} from './data';

// 可变状态（与原 MSW handlers 一致）
let lifeCount = 3;
let reviveUsed = 0;

function computeUnlocked(level: Level): boolean {
  // 尊重 data 中显式标记为已解锁的游戏（如分类大挑战 mock 需单独解锁）
  if (level.unlocked === true) return true;
  if (!level.unlock_prev_level_id) return true;
  const prev = levels.find((x) => x.id === level.unlock_prev_level_id);
  return prev?.best_score !== undefined && prev?.best_score !== null;
}

// --- auth ---
export async function mockAuthExchangeCode(code: string): Promise<{ token: string; user: UserInfo }> {
  if (!code) throw new Error('code 缺失');
  return { token: 'mock-token', user: { ...mockUser, life: lifeCount } as UserInfo };
}

// --- user ---
export async function mockFetchMe(): Promise<UserInfo> {
  return { ...mockUser, life: lifeCount } as UserInfo;
}

export async function mockFetchPointTransactions(): Promise<PointTransaction[]> {
  return pointTransactions;
}

// --- life ---
export async function mockFetchLife(): Promise<LifeInfo> {
  return {
    life_count: lifeCount,
    daily_reset_date: new Date().toISOString().slice(0, 10),
    today_revive_used: reviveUsed,
    today_revive_limit: 3,
  };
}

export async function mockRevive(type: 'task' | 'points'): Promise<LifeInfo> {
  if (reviveUsed >= 3) throw new Error('今日复活已达上限');
  reviveUsed += 1;
  lifeCount = Math.min(3, lifeCount + 1);
  if (type === 'points') (mockUser as { points: number }).points = Math.max(0, (mockUser as { points: number }).points - 50);
  return mockFetchLife();
}

// --- scenes ---
export async function mockFetchScenes(): Promise<Scene[]> {
  return scenes;
}

export async function mockFetchModules(sceneId: number): Promise<LevelModule[]> {
  return modules.filter((m) => m.scene_id === sceneId);
}

// --- levels ---
export async function mockFetchLevelsByModule(moduleId: number): Promise<Level[]> {
  return levels
    .filter((l) => l.module_id === moduleId)
    .map((l) => ({ ...l, unlocked: computeUnlocked(l) }));
}

export async function mockFetchLevel(id: number): Promise<Level> {
  const level = levels.find((l) => l.id === id);
  if (!level) throw new Error('游戏不存在');
  return { ...level, unlocked: computeUnlocked(level) };
}

// --- leaderboard ---
export async function mockFetchLeaderboard(): Promise<LeaderboardResponse> {
  return { items: leaderboard, updatedAt: new Date().toISOString() };
}

// --- attempts ---
export async function mockCreateAttempt(levelId: number): Promise<Attempt> {
  const attempt: Attempt = {
    id: Date.now(),
    level_id: levelId,
    status: 'in_progress',
    start_at: new Date().toISOString(),
    error_count: 0,
    key_error_count: 0,
  };
  attempts.push(attempt);
  return attempt;
}

export async function mockSendEvents(_attemptId: number, events: AttemptEvent[]): Promise<void> {
  const attempt = attempts[attempts.length - 1];
  if (attempt && Array.isArray(events)) {
    attempt.error_count = events.filter((e) => e.event_type === 'step_error').length;
    attempt.key_error_count = events.filter((e) => e.is_key_error).length;
  }
}

export async function mockSettleAttempt(attemptId: number, payload: Partial<Attempt> & { status?: AttemptStatus }): Promise<Attempt> {
  const attempt = attempts.find((a) => a.id === attemptId);
  if (!attempt) throw new Error('挑战不存在');
  Object.assign(attempt, payload, { end_at: new Date().toISOString() });
  if (payload.status === 'failed') lifeCount = Math.max(0, lifeCount - 1);
  if (payload.status === 'passed') {
    const level = levels.find((l) => l.id === attempt.level_id);
    if (level) {
      level.best_score = Math.max(level.best_score ?? 0, payload.score ?? 0);
      level.best_duration_ms = Math.min(level.best_duration_ms ?? Infinity, payload.duration_ms ?? Infinity);
      level.unlocked = true;
      const next = levels.find((l) => l.unlock_prev_level_id === level.id);
      if (next) next.unlocked = true;
    }
  }
  return attempt;
}

export async function mockFetchAttemptReview(attemptId: number): Promise<AttemptReview> {
  const attempt = attempts.find((a) => a.id === attemptId);
  if (!attempt) throw new Error('挑战不存在');
  return {
    timeline: [
      { ts: attempt.start_at, step: '检查安全帽', result: 'ok' },
      { ts: new Date().toISOString(), step: '佩戴护目镜', result: 'error', knowledge_point: '防护装备' },
    ],
  };
}

// --- store ---
export async function mockFetchItems(): Promise<StoreItem[]> {
  return storeItems;
}

export async function mockCreateOrder(itemId: number): Promise<StoreOrder> {
  const item = storeItems.find((i) => i.id === itemId);
  if (!item || item.stock <= 0) throw new Error('库存不足');
  item.stock -= 1;
  (mockUser as { points: number }).points -= item.cost_points;
  const order: StoreOrder = {
    id: Date.now(),
    item_id: item.id,
    status: 'fulfilled',
    cost_points: item.cost_points,
    created_at: new Date().toISOString(),
  };
  storeOrders.push(order);
  return order;
}

export async function mockFetchOrders(): Promise<StoreOrder[]> {
  return storeOrders;
}

// --- learning ---
export async function mockFetchCategories(): Promise<LearningCategory[]> {
  return learningCategories;
}

export async function mockFetchMaterials(categoryId?: number): Promise<LearningMaterial[]> {
  if (categoryId != null) return learningMaterials.filter((m) => m.category_id === categoryId);
  return learningMaterials;
}

export async function mockSubmitLearningRecord(_materialId: number, _status: string): Promise<void> {
  // no-op for mock
}
