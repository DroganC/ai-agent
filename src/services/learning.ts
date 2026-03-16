/**
 * 学习中心相关接口：学习分类、学习资料列表、提交学习记录。
 */
import { http } from './http';
import { getApiPrefix } from './prefix';
import { ApiResponse, LearningCategory, LearningMaterial } from '../types/api';
import { USE_MOCK } from '../config/env';
import {
  mockFetchCategories,
  mockFetchMaterials,
  mockSubmitLearningRecord,
} from '../mocks/api';

/**
 * 拉取学习分类列表（树形或扁平，用于学习中心左侧/顶部筛选）。
 * @returns 分类列表
 */
export const fetchCategories = async () => {
  if (USE_MOCK) return mockFetchCategories();
  const { data } = await http.get<ApiResponse<LearningCategory[]>>({ url: getApiPrefix('learning/categories') });
  return data.data;
};

/**
 * 拉取学习资料列表，可按分类筛选。
 * @param categoryId - 可选，分类 ID，不传则返回全部
 * @returns 学习资料列表（文档、视频等）
 */
export const fetchMaterials = async (categoryId?: number) => {
  if (USE_MOCK) return mockFetchMaterials(categoryId);
  const { data } = await http.get<ApiResponse<LearningMaterial[]>>({ url: getApiPrefix('learning/materials'), params: { categoryId } });
  return data.data;
};

/**
 * 提交某条学习资料的学习记录（已查看/已完成）。
 * @param materialId - 资料 ID
 * @param status - 学习状态：viewed | completed
 */
export const submitLearningRecord = async (materialId: number, status: 'viewed' | 'completed') => {
  if (USE_MOCK) return mockSubmitLearningRecord(materialId, status);
  await http.post({ url: getApiPrefix('learning/records'), data: { materialId, status } });
};
