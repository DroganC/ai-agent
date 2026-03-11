import { http } from './http';
import { ApiResponse, Attempt, AttemptEvent, AttemptReview } from '../types/api';
import { v4 as uuid } from 'uuid';
import { USE_MOCK } from '../config/env';
import {
  mockCreateAttempt,
  mockFetchAttemptReview,
  mockSendEvents,
  mockSettleAttempt,
} from '../mocks/api';

export const createAttempt = async (levelId: number) => {
  if (USE_MOCK) return mockCreateAttempt(levelId);
  const { data } = await http.post<ApiResponse<Attempt>>('/attempts', { levelId }, { headers: { 'x-idempotency-key': uuid() } });
  return data.data;
};

export const sendEvents = async (attemptId: number, events: AttemptEvent[]) => {
  if (USE_MOCK) return mockSendEvents(attemptId, events);
  await http.post(`/attempts/${attemptId}/events`, { events });
};

export const settleAttempt = async (attemptId: number, payload: Partial<Attempt>) => {
  if (USE_MOCK) return mockSettleAttempt(attemptId, payload);
  const { data } = await http.patch<ApiResponse<Attempt>>(`/attempts/${attemptId}`, payload, { headers: { 'x-idempotency-key': uuid() } });
  return data.data;
};

export const fetchAttemptReview = async (attemptId: number) => {
  if (USE_MOCK) return mockFetchAttemptReview(attemptId);
  const { data } = await http.get<ApiResponse<AttemptReview>>(`/attempts/${attemptId}/review`);
  return data.data;
};
