import { http } from './http';
import { ApiResponse, LeaderboardResponse } from '../types/api';
import { USE_MOCK } from '../config/env';
import { mockFetchLeaderboard } from '../mocks/api';

export const fetchLeaderboard = async () => {
  if (USE_MOCK) return mockFetchLeaderboard();
  const { data } = await http.get<ApiResponse<LeaderboardResponse>>('/leaderboards/personal');
  return data.data;
};
