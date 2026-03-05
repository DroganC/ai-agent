import { http } from './http';
import { ApiResponse, Attempt, AttemptEvent, AttemptReview } from '../types/api';
import { v4 as uuid } from 'uuid';

export const createAttempt = async (levelId: number) => {
  const { data } = await http.post<ApiResponse<Attempt>>('/attempts', { levelId }, { headers: { 'x-idempotency-key': uuid() } });
  return data.data;
};

export const sendEvents = async (attemptId: number, events: AttemptEvent[]) => {
  await http.post(`/attempts/${attemptId}/events`, { events });
};

export const settleAttempt = async (attemptId: number, payload: Partial<Attempt>) => {
  const { data } = await http.patch<ApiResponse<Attempt>>(`/attempts/${attemptId}`, payload, { headers: { 'x-idempotency-key': uuid() } });
  return data.data;
};

export const fetchAttemptReview = async (attemptId: number) => {
  const { data } = await http.get<ApiResponse<AttemptReview>>(`/attempts/${attemptId}/review`);
  return data.data;
};
