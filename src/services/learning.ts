import { http } from './http';
import { ApiResponse, LearningCategory, LearningMaterial } from '../types/api';

export const fetchCategories = async () => {
  const { data } = await http.get<ApiResponse<LearningCategory[]>>('/learning/categories');
  return data.data;
};

export const fetchMaterials = async (categoryId?: number) => {
  const { data } = await http.get<ApiResponse<LearningMaterial[]>>('/learning/materials', { params: { categoryId } });
  return data.data;
};

export const submitLearningRecord = async (materialId: number, status: 'viewed' | 'completed') => {
  await http.post('/learning/records', { materialId, status });
};
