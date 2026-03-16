/**
 * 生命值相关接口：查询当前生命、复活（任务/积分方式）。
 * 游戏失败扣生命，生命为 0 时需复活后才能继续挑战。
 */
import { http } from './http';
import { getApiPrefix } from './prefix';
import { ApiResponse, LifeInfo } from '../types/api';
import { v4 as uuid } from 'uuid';
import { USE_MOCK } from '../config/env';
import { mockFetchLife, mockRevive } from '../mocks/api';

/**
 * 拉取当前用户的生命值信息（剩余次数、今日已复活次数等）。
 * @returns 生命信息
 */
export const fetchLife = async () => {
  if (USE_MOCK) return mockFetchLife();
  const { data } = await http.get<ApiResponse<LifeInfo>>({ url: getApiPrefix('users/me/life') });
  return data.data;
};

/**
 * 执行一次复活，增加生命值。支持任务复活或积分兑换复活。
 * @param type - 复活方式：task | points
 * @returns 更新后的生命信息
 */
export const revive = async (type: 'task' | 'points') => {
  if (USE_MOCK) return mockRevive(type);
  const { data } = await http.post<ApiResponse<LifeInfo>>({
    url: getApiPrefix('revives'),
    data: { type },
    headers: { 'x-idempotency-key': uuid() },
  });
  return data.data;
};
