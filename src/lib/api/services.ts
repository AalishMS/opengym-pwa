import { api } from './http';
import type { Plan, PlanCreatePayload, Session, SessionCreatePayload } from '@/types';

export async function fetchPlans(): Promise<Plan[]> {
  const { data } = await api.get<Plan[]>('/plans');
  return data;
}

export async function createPlanApi(payload: PlanCreatePayload): Promise<Plan> {
  const { data } = await api.post<Plan>('/plans', payload);
  return data;
}

export async function updatePlanApi(id: string, payload: PlanCreatePayload): Promise<Plan> {
  const { data } = await api.put<Plan>(`/plans/${id}`, payload);
  return data;
}

export async function deletePlanApi(id: string): Promise<void> {
  await api.delete(`/plans/${id}`);
}

export async function fetchSessions(): Promise<Session[]> {
  const { data } = await api.get<Session[]>('/sessions');
  return data;
}

export async function createSessionApi(payload: SessionCreatePayload): Promise<Session> {
  const { data } = await api.post<Session>('/sessions', payload);
  return data;
}

export async function updateSessionApi(id: string, payload: SessionCreatePayload): Promise<Session> {
  const { data } = await api.put<Session>(`/sessions/${id}`, payload);
  return data;
}

export async function deleteSessionApi(id: string): Promise<void> {
  await api.delete(`/sessions/${id}`);
}
