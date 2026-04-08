import { db } from './index';
import type { Session, SessionCreatePayload } from '@/types';

export async function getAllSessions(): Promise<Session[]> {
  return db.sessions.orderBy('date').reverse().toArray();
}

export async function getSessionById(id: string): Promise<Session | undefined> {
  return db.sessions.get(id);
}

export async function saveSession(session: Session): Promise<string> {
  return db.sessions.put(session);
}

export async function createSession(payload: SessionCreatePayload): Promise<Session> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const session: Session = {
    id,
    plan_name: payload.plan_name,
    date: payload.date,
    week_number: payload.week_number,
    exercises: payload.exercises.map((ex, exIdx) => ({
      ...ex,
      id: crypto.randomUUID(),
      order_index: exIdx,
      sets: ex.sets.map((set) => ({
        ...set,
        id: crypto.randomUUID()
      }))
    })),
    synced: false,
    updatedAt: now
  };
  await db.sessions.put(session);
  return session;
}

export async function updateSession(id: string, payload: SessionCreatePayload): Promise<Session> {
  const now = new Date().toISOString();
  const session: Session = {
    id,
    plan_name: payload.plan_name,
    date: payload.date,
    week_number: payload.week_number,
    exercises: payload.exercises.map((ex, exIdx) => ({
      ...ex,
      id: crypto.randomUUID(),
      order_index: exIdx,
      sets: ex.sets.map((set) => ({
        ...set,
        id: crypto.randomUUID()
      }))
    })),
    synced: false,
    updatedAt: now
  };
  await db.sessions.put(session);
  return session;
}

export async function deleteSession(id: string): Promise<void> {
  await db.sessions.delete(id);
}

export async function markSessionSynced(id: string): Promise<void> {
  await db.sessions.update(id, { synced: true });
}

export async function getUnsyncedSessions(): Promise<Session[]> {
  const all = await db.sessions.toArray();
  return all.filter((s: Session) => !s.synced);
}

export function calculateVolume(session: Session): number {
  return session.exercises.reduce((total, ex) => {
    return total + ex.sets.reduce((setTotal, set) => {
      return setTotal + (set.reps * set.weight);
    }, 0);
  }, 0);
}
