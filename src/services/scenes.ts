/**
 * 场景与模块相关接口：场景列表、某场景下的模块列表。
 * 用于首页/游戏列表页的场景筛选与分组展示。
 */
import { http } from './http';
import { getApiPrefix } from './prefix';
import { ApiResponse, LevelModule, Scene } from '../types/api';
import { USE_MOCK } from '../config/env';
import { mockFetchScenes, mockFetchModules } from '../mocks/api';

/**
 * 拉取全部场景列表（如办公楼、厂区等）。
 * @returns 场景列表
 */
export const fetchScenes = async () => {
  if (USE_MOCK) return mockFetchScenes();
  const { data } = await http.get<ApiResponse<Scene[]>>({ url: getApiPrefix('scenes') });
  return data.data;
};

/**
 * 拉取指定场景下的模块列表（如基础知识、应急处置等）。
 * @param sceneId - 场景 ID
 * @returns 该场景下的模块列表
 */
export const fetchModules = async (sceneId: number) => {
  if (USE_MOCK) return mockFetchModules(sceneId);
  const { data } = await http.get<ApiResponse<LevelModule[]>>({ url: getApiPrefix(`scenes/${sceneId}/modules`) });
  return data.data;
};




