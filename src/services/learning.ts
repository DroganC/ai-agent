import { http } from './http';
import { ApiResponse, LearningCategory, LearningMaterial } from '../types/api';
import { USE_MOCK } from '../config/env';
import {
  mockFetchCategories,
  mockFetchMaterials,
  mockSubmitLearningRecord,
} from '../mocks/api';

export const fetchCategories = async () => {
  if (USE_MOCK) return mockFetchCategories();
  const { data } = await http.get<ApiResponse<LearningCategory[]>>('/learning/categories');
  return data.data;
};

export const fetchMaterials = async (categoryId?: number) => {
  if (USE_MOCK) return mockFetchMaterials(categoryId);
  const { data } = await http.get<ApiResponse<LearningMaterial[]>>('/learning/materials', { params: { categoryId } });
  return data.data;
};

export const submitLearningRecord = async (materialId: number, status: 'viewed' | 'completed') => {
  if (USE_MOCK) return mockSubmitLearningRecord(materialId, status);
  await http.post('/learning/records', { materialId, status });
};
