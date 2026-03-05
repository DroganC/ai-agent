import { http } from './http';
import { ApiResponse, LevelModule, Scene } from '../types/api';

export const fetchScenes = async () => {
  const { data } = await http.get<ApiResponse<Scene[]>>('/scenes');
  return data.data;
};

export const fetchModules = async (sceneId: number) => {
  const { data } = await http.get<ApiResponse<LevelModule[]>>(`/scenes/${sceneId}/modules`);
  return data.data;
};
