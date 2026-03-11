import { http } from './http';
import { ApiResponse, LevelModule, Scene } from '../types/api';
import { USE_MOCK } from '../config/env';
import { mockFetchScenes, mockFetchModules } from '../mocks/api';

export const fetchScenes = async () => {
  if (USE_MOCK) return mockFetchScenes();
  const { data } = await http.get<ApiResponse<Scene[]>>('/scenes');
  return data.data;
};

export const fetchModules = async (sceneId: number) => {
  if (USE_MOCK) return mockFetchModules(sceneId);
  const { data } = await http.get<ApiResponse<LevelModule[]>>(`/scenes/${sceneId}/modules`);
  return data.data;
};
