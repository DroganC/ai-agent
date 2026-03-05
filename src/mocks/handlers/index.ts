import { http, HttpResponse } from 'msw';
import { attempts, leaderboard, learningCategories, learningMaterials, levels, mockUser, modules, pointTransactions, scenes, storeItems, storeOrders } from '../data';
import type { Attempt, AttemptEvent, AttemptStatus, LifeInfo, StoreOrder } from '../../types/api';

let lifeCount = 3;
let reviveUsed = 0;

const withMeta = <T>(data: T) => ({ data, meta: { requestId: 'mock-' + Date.now() } });

type CreateAttemptBody = { levelId: number };
type EventsBody = { events?: AttemptEvent[] };
type SettleAttemptBody = Partial<Attempt> & { status?: AttemptStatus };
type CreateOrderBody = { itemId: number };
type ReviveBody = { type: 'task' | 'points' };

export const handlers = [
  http.get('/api/v1/auth/come/callback', ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    if (!code) return HttpResponse.json({ error: { code: 'INVALID_CODE', message: 'code 缺失' } }, { status: 400 });
    return HttpResponse.json(withMeta({ token: 'mock-token', user: { ...mockUser, life: lifeCount } }));
  }),

  http.get('/api/v1/users/me', () => HttpResponse.json(withMeta({ ...mockUser, life: lifeCount }))),

  http.get('/api/v1/users/me/life', () =>
    HttpResponse.json(withMeta({
      life_count: lifeCount,
      daily_reset_date: new Date().toISOString().slice(0, 10),
      today_revive_used: reviveUsed,
      today_revive_limit: 3,
    }))
  ),

  http.get('/api/v1/scenes', () => HttpResponse.json(withMeta(scenes))),
  http.get('/api/v1/scenes/:sceneId/modules', ({ params }) => {
    const list = modules.filter((m) => m.scene_id === Number(params.sceneId));
    return HttpResponse.json(withMeta(list));
  }),

  http.get('/api/v1/modules/:moduleId/levels', ({ params }) => {
    const list = levels
      .filter((l) => l.module_id === Number(params.moduleId))
      .map((l) => ({
        ...l,
        unlocked: l.unlock_prev_level_id ? levels.find((x) => x.id === l.unlock_prev_level_id)?.best_score !== undefined : true,
      }));
    return HttpResponse.json(withMeta(list));
  }),

  http.get('/api/v1/levels/:levelId', ({ params }) => {
    const level = levels.find((l) => l.id === Number(params.levelId));
    if (!level) return HttpResponse.json({ error: { code: 'NOT_FOUND', message: '关卡不存在' } }, { status: 404 });
    return HttpResponse.json(withMeta(level));
  }),

  http.post('/api/v1/attempts', async ({ request }) => {
    const body = (await request.json()) as CreateAttemptBody;
    const attempt: Attempt = {
      id: Date.now(),
      level_id: body.levelId,
      status: 'in_progress',
      start_at: new Date().toISOString(),
      error_count: 0,
      key_error_count: 0,
    };
    attempts.push(attempt);
    return HttpResponse.json(withMeta(attempt));
  }),

  http.post('/api/v1/attempts/:attemptId/events', async ({ params, request }) => {
    const attempt = attempts.find((a) => a.id === Number(params.attemptId));
    if (!attempt) return HttpResponse.json({ error: { code: 'NOT_FOUND', message: '挑战不存在' } }, { status: 404 });
    const body = (await request.json()) as EventsBody;
    if (Array.isArray(body?.events)) {
      attempt.error_count = body.events.filter((e) => e.event_type === 'step_error').length;
      attempt.key_error_count = body.events.filter((e) => e.is_key_error).length;
    }
    return HttpResponse.json(withMeta(true));
  }),

  http.patch('/api/v1/attempts/:attemptId', async ({ params, request }) => {
    const attempt = attempts.find((a) => a.id === Number(params.attemptId));
    if (!attempt) return HttpResponse.json({ error: { code: 'NOT_FOUND', message: '挑战不存在' } }, { status: 404 });
    const body = (await request.json()) as SettleAttemptBody;
    Object.assign(attempt, body, { end_at: new Date().toISOString() });
    // Life deduction and unlock progression are simulated in mock layer
    // to keep front-end flow aligned with backend contract.
    if (body.status === 'failed') lifeCount = Math.max(0, lifeCount - 1);
    if (body.status === 'passed') {
      const level = levels.find((l) => l.id === attempt.level_id);
      if (level) {
        level.best_score = Math.max(level.best_score ?? 0, body.score ?? 0);
        level.best_duration_ms = Math.min(level.best_duration_ms ?? Infinity, body.duration_ms ?? Infinity);
        level.unlocked = true;
        const next = levels.find((l) => l.unlock_prev_level_id === level.id);
        if (next) next.unlocked = true;
      }
    }
    return HttpResponse.json(withMeta(attempt));
  }),

  http.get('/api/v1/attempts/:attemptId/review', ({ params }) => {
    const attempt = attempts.find((a) => a.id === Number(params.attemptId));
    if (!attempt) return HttpResponse.json({ error: { code: 'NOT_FOUND', message: '挑战不存在' } }, { status: 404 });
    return HttpResponse.json(
      withMeta({
        timeline: [
          { ts: attempt.start_at, step: '检查安全帽', result: 'ok' },
          { ts: new Date().toISOString(), step: '佩戴护目镜', result: 'error', knowledge_point: '防护装备' },
        ],
      })
    );
  }),

  http.get('/api/v1/leaderboards/personal', () => HttpResponse.json(withMeta({ items: leaderboard, updatedAt: new Date().toISOString() }))),

  http.get('/api/v1/users/me/points', () => HttpResponse.json(withMeta({ balance: mockUser.points })) ),
  http.get('/api/v1/users/me/point-transactions', () => HttpResponse.json(withMeta(pointTransactions))),

  http.get('/api/v1/store/items', () => HttpResponse.json(withMeta(storeItems))),
  http.get('/api/v1/store/items/:itemId', ({ params }) => {
    const item = storeItems.find((i) => i.id === Number(params.itemId));
    if (!item) return HttpResponse.json({ error: { code: 'NOT_FOUND', message: '商品不存在' } }, { status: 404 });
    return HttpResponse.json(withMeta(item));
  }),
  http.post('/api/v1/store/orders', async ({ request }) => {
    const body = (await request.json()) as CreateOrderBody;
    const item = storeItems.find((i) => i.id === body.itemId);
    if (!item || item.stock <= 0) return HttpResponse.json({ error: { code: 'STOCK_NOT_ENOUGH', message: '库存不足' } }, { status: 409 });
    item.stock -= 1;
    mockUser.points -= item.cost_points;
    const order: StoreOrder = {
      id: Date.now(),
      item_id: item.id,
      status: 'fulfilled',
      cost_points: item.cost_points,
      created_at: new Date().toISOString(),
    };
    storeOrders.push(order);
    return HttpResponse.json(withMeta(order));
  }),
  http.get('/api/v1/store/orders', () => HttpResponse.json(withMeta(storeOrders))),

  http.post('/api/v1/revives', async ({ request }) => {
    const body = (await request.json()) as ReviveBody;
    if (reviveUsed >= 3) return HttpResponse.json({ error: { code: 'REVIVE_LIMIT', message: '今日复活已达上限' } }, { status: 409 });
    reviveUsed += 1;
    lifeCount = Math.min(3, lifeCount + 1);
    if (body.type === 'points') mockUser.points = Math.max(0, mockUser.points - 50);
    const lifeInfo: LifeInfo = {
      life_count: lifeCount,
      daily_reset_date: new Date().toISOString().slice(0, 10),
      today_revive_used: reviveUsed,
      today_revive_limit: 3,
    };
    return HttpResponse.json(
      withMeta(lifeInfo)
    );
  }),

  http.get('/api/v1/learning/categories', () => HttpResponse.json(withMeta(learningCategories))),
  http.get('/api/v1/learning/materials', ({ request }) => {
    const url = new URL(request.url);
    const categoryId = url.searchParams.get('categoryId');
    const list = categoryId ? learningMaterials.filter((m) => m.category_id === Number(categoryId)) : learningMaterials;
    return HttpResponse.json(withMeta(list));
  }),
  http.get('/api/v1/learning/materials/:id', ({ params }) => {
    const material = learningMaterials.find((m) => m.id === Number(params.id));
    if (!material) return HttpResponse.json({ error: { code: 'NOT_FOUND', message: '资料不存在' } }, { status: 404 });
    return HttpResponse.json(withMeta(material));
  }),
  http.post('/api/v1/learning/records', () => HttpResponse.json(withMeta(true))),
];
