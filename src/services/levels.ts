import { http } from './http';
import { ApiResponse, Level } from '../types/api';

export const fetchLevelsByModule = async (moduleId: number) => {
  const { data } = await http.get<ApiResponse<Level[]>>(`/modules/${moduleId}/levels`);
  return data.data;
};

export const fetchLevel = async (id: number) => {
  const { data } = await http.get<ApiResponse<Level>>(`/levels/${id}`);
  return data.data;
};
