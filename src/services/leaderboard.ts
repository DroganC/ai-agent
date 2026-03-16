/**
 * 排行榜相关接口：拉取个人/全局排行榜数据。
 */
import { http } from './http';
import { getApiPrefix } from './prefix';
import { ApiResponse, LeaderboardResponse } from '../types/api';
import { USE_MOCK } from '../config/env';
import { mockFetchLeaderboard } from '../mocks/api';

/**
 * 拉取排行榜数据（当前为个人榜，可扩展 scope/game_id 等筛选）。
 * @returns 排行榜条目列表及更新时间
 */
export const fetchLeaderboard = async () => {
  if (USE_MOCK) return mockFetchLeaderboard();
  const { data } = await http.get<ApiResponse<LeaderboardResponse>>({ url: getApiPrefix('leaderboards/personal') });
  return data.data;
};
