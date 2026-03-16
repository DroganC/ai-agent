/**
 * 游戏尝试（attempt）相关接口：创建尝试、上报步骤事件、结算、拉取复盘。
 * 从「开始挑战」创建 attempt，到游戏内上报事件，结束时 settle，结算页拉取 review。
 */
import { http } from './http';
import { getApiPrefix } from './prefix';
import { ApiResponse, Attempt, AttemptEvent, AttemptReview } from '../types/api';
import { v4 as uuid } from 'uuid';
import { USE_MOCK } from '../config/env';
import {
  mockCreateAttempt,
  mockFetchAttemptReview,
  mockSendEvents,
  mockSettleAttempt,
} from '../mocks/api';

/**
 * 为指定游戏创建一次尝试，进入游戏内页时调用。
 * @param levelId - 游戏（关卡）ID
 * @returns 新建的 attempt（含 id、status、start_at 等）
 */
export const createAttempt = async (levelId: number) => {
  if (USE_MOCK) return mockCreateAttempt(levelId);
  const { data } = await http.post<ApiResponse<Attempt>>({
    url: getApiPrefix('attempts'),
    data: { levelId },
    headers: { 'x-idempotency-key': uuid() },
  });
  return data.data;
};

/**
 * 上报本局游戏内的步骤事件（正确/错误、关键错误等），游戏过程中可多次调用。
 * @param attemptId - 当前尝试 ID
 * @param events - 本批事件列表
 */
export const sendEvents = async (attemptId: number, events: AttemptEvent[]) => {
  if (USE_MOCK) return mockSendEvents(attemptId, events);
  await http.post({ url: getApiPrefix(`attempts/${attemptId}/events`), data: { events } });
};

/**
 * 结算一次尝试（通过/失败、得分、耗时等），游戏结束时调用。
 * @param attemptId - 尝试 ID
 * @param payload - 结算字段（status、score、duration_ms、fail_reason 等）
 * @returns 更新后的 attempt
 */
export const settleAttempt = async (attemptId: number, payload: Partial<Attempt>) => {
  if (USE_MOCK) return mockSettleAttempt(attemptId, payload);
  const { data } = await http.patch<ApiResponse<Attempt>>({
    url: getApiPrefix(`attempts/${attemptId}`),
    data: payload as Record<string, unknown>,
    headers: { 'x-idempotency-key': uuid() },
  });
  return data.data;
};

/**
 * 拉取某次尝试的复盘数据（如错误时间线），用于结算页展示。
 * @param attemptId - 尝试 ID
 * @returns 复盘数据（含 timeline 等）
 */
export const fetchAttemptReview = async (attemptId: number) => {
  if (USE_MOCK) return mockFetchAttemptReview(attemptId);
  const { data } = await http.get<ApiResponse<AttemptReview>>({ url: getApiPrefix(`attempts/${attemptId}/review`) });
  return data.data;
};
