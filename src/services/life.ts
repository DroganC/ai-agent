import { http } from './http';
import { ApiResponse, LifeInfo } from '../types/api';
import { v4 as uuid } from 'uuid';
import { USE_MOCK } from '../config/env';
import { mockFetchLife, mockRevive } from '../mocks/api';

export const fetchLife = async () => {
  if (USE_MOCK) return mockFetchLife();
  const { data } = await http.get<ApiResponse<LifeInfo>>('/users/me/life');
  return data.data;
};

export const revive = async (type: 'task' | 'points') => {
  if (USE_MOCK) return mockRevive(type);
  const { data } = await http.post<ApiResponse<LifeInfo>>(
    '/revives',
    { type },
    { headers: { 'x-idempotency-key': uuid() } }
  );
  return data.data;
};
