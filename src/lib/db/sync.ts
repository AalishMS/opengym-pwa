import { db } from './index';
import type { PendingWrite } from '@/types';
import { api } from '../api/http';
import { markPlanSynced } from './plans';
import { markSessionSynced } from './sessions';

export async function addToPendingWrites(
  type: PendingWrite['type'],
  entity: PendingWrite['entity'],
  payload: unknown
): Promise<string> {
  const id = crypto.randomUUID();
  const write: PendingWrite = {
    id,
    type,
    entity,
    payload,
    timestamp: Date.now(),
    retries: 0
  };
  await db.pendingWrites.put(write);
  return id;
}

export async function getPendingWrites(): Promise<PendingWrite[]> {
  return db.pendingWrites.orderBy('timestamp').toArray();
}

export async function removePendingWrite(id: string): Promise<void> {
  await db.pendingWrites.delete(id);
}

export async function incrementPendingWriteRetries(id: string): Promise<void> {
  await db.pendingWrites.update(id, { retries: (await db.pendingWrites.get(id))!.retries + 1 });
}

export async function processSync(): Promise<{ success: number; failed: number }> {
  const pending = await getPendingWrites();
  let success = 0;
  let failed = 0;

  for (const write of pending) {
    try {
      if (write.entity === 'plan') {
        const payload = write.payload as { id: string; name: string; exercises: unknown[] };
        
        if (write.type === 'CREATE') {
          await api.post('/plans', {
            name: payload.name,
            exercises: payload.exercises
          });
        } else if (write.type === 'UPDATE') {
          await api.put(`/plans/${payload.id}`, {
            name: payload.name,
            exercises: payload.exercises
          });
        } else if (write.type === 'DELETE') {
          await api.delete(`/plans/${payload.id}`);
        }
        
        await markPlanSynced(payload.id);
      } else if (write.entity === 'session') {
        const payload = write.payload as { id: string; plan_name?: string; date: string; week_number: number; exercises: unknown[] };
        
        if (write.type === 'CREATE') {
          await api.post('/sessions', {
            plan_name: payload.plan_name,
            date: payload.date,
            week_number: payload.week_number,
            exercises: payload.exercises
          });
        } else if (write.type === 'UPDATE') {
          await api.put(`/sessions/${payload.id}`, {
            plan_name: payload.plan_name,
            date: payload.date,
            week_number: payload.week_number,
            exercises: payload.exercises
          });
        } else if (write.type === 'DELETE') {
          await api.delete(`/sessions/${payload.id}`);
        }
        
        await markSessionSynced(payload.id);
      }
      
      await removePendingWrite(write.id);
      success++;
    } catch (error) {
      console.error('Sync failed for write:', write.id, error);
      await incrementPendingWriteRetries(write.id);
      failed++;
    }
  }

  return { success, failed };
}

export async function getPendingWritesCount(): Promise<number> {
  return db.pendingWrites.count();
}
