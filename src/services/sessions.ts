import { http } from "@/services/http";
import type { Session, SessionCreatePayload } from "@/services/types";

export async function getSessions() {
  const { data } = await http.get<Session[]>("/sessions");
  return data;
}

export async function createSession(payload: SessionCreatePayload) {
  const { data } = await http.post<Session>("/sessions", payload);
  return data;
}

export async function updateSession(sessionId: string, payload: SessionCreatePayload) {
  const { data } = await http.put<Session>(`/sessions/${sessionId}`, payload);
  return data;
}

export async function deleteSession(sessionId: string) {
  await http.delete(`/sessions/${sessionId}`);
}
