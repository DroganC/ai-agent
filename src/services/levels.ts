import { http } from './http';
import { ApiResponse, Level } from '../types/api';
import { USE_MOCK } from '../config/env';
import { mockFetchLevel, mockFetchLevelsByModule } from '../mocks/api';

export const fetchLevelsByModule = async (moduleId: number) => {
  if (USE_MOCK) return mockFetchLevelsByModule(moduleId);
  const { data } = await http.get<ApiResponse<Level[]>>(`/modules/${moduleId}/levels`);
  return data.data;
};

export const fetchLevel = async (id: number) => {
  if (USE_MOCK) return mockFetchLevel(id);
  const { data } = await http.get<ApiResponse<Level>>(`/levels/${id}`);
  return data.data;
};
