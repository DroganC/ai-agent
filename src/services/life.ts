import { http } from './http';
import { ApiResponse, LifeInfo } from '../types/api';
import { v4 as uuid } from 'uuid';

export const fetchLife = async () => {
  const { data } = await http.get<ApiResponse<LifeInfo>>('/users/me/life');
  return data.data;
};

export const revive = async (type: 'task' | 'points') => {
  const { data } = await http.post<ApiResponse<LifeInfo>>(
    '/revives',
    { type },
    { headers: { 'x-idempotency-key': uuid() } }
  );
  return data.data;
};
