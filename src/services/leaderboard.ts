import { http } from './http';
import { ApiResponse, LeaderboardResponse } from '../types/api';

export const fetchLeaderboard = async () => {
  const { data } = await http.get<ApiResponse<LeaderboardResponse>>('/leaderboards/personal');
  return data.data;
};
