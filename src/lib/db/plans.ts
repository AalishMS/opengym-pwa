import { db } from './index';
import type { Plan, PlanCreatePayload } from '@/types';

export async function getAllPlans(): Promise<Plan[]> {
  return db.plans.orderBy('updatedAt').reverse().toArray();
}

export async function getPlanById(id: string): Promise<Plan | undefined> {
  return db.plans.get(id);
}

export async function savePlan(plan: Plan): Promise<string> {
  return db.plans.put(plan);
}

export async function createPlan(payload: PlanCreatePayload): Promise<Plan> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const plan: Plan = {
    id,
    name: payload.name,
    exercises: payload.exercises.map((ex, idx) => ({
      ...ex,
      id: crypto.randomUUID(),
      order_index: idx
    })),
    synced: false,
    updatedAt: now
  };
  await db.plans.put(plan);
  return plan;
}

export async function updatePlan(id: string, payload: PlanCreatePayload): Promise<Plan> {
  const now = new Date().toISOString();
  const plan: Plan = {
    id,
    name: payload.name,
    exercises: payload.exercises.map((ex, idx) => ({
      ...ex,
      id: crypto.randomUUID(),
      order_index: idx
    })),
    synced: false,
    updatedAt: now
  };
  await db.plans.put(plan);
  return plan;
}

export async function deletePlan(id: string): Promise<void> {
  await db.plans.delete(id);
}

export async function markPlanSynced(id: string): Promise<void> {
  await db.plans.update(id, { synced: true });
}

export async function getUnsyncedPlans(): Promise<Plan[]> {
  const all = await db.plans.toArray();
  return all.filter((p: Plan) => !p.synced);
}
