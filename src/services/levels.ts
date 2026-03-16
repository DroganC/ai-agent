/**
 * 游戏/关卡相关接口：按模块拉取游戏列表、拉取单条游戏详情。
 */
import { http } from './http';
import { getApiPrefix } from './prefix';
import { ApiResponse, Level } from '../types/api';
import { USE_MOCK } from '../config/env';
import { mockFetchLevel, mockFetchLevelsByModule } from '../mocks/api';

/**
 * 按模块拉取该模块下的游戏列表（含解锁状态、奖励积分等）。
 * @param moduleId - 模块 ID
 * @returns 该模块下的游戏列表
 */
export const fetchLevelsByModule = async (moduleId: number) => {
  if (USE_MOCK) return mockFetchLevelsByModule(moduleId);
  const { data } = await http.get<ApiResponse<Level[]>>({ url: getApiPrefix(`modules/${moduleId}/levels`) });
  return data.data;
};

/**
 * 拉取单条游戏详情（名称、难度、奖励、game_type 等）。
 * @param id - 游戏（关卡）ID
 * @returns 游戏详情
 */
export const fetchLevel = async (id: number) => {
  if (USE_MOCK) return mockFetchLevel(id);
  const { data } = await http.get<ApiResponse<Level>>({ url: getApiPrefix(`levels/${id}`) });
  return data.data;
};
