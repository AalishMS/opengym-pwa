import Dexie, { type EntityTable } from 'dexie';
import type { Plan, Session, PendingWrite } from '@/types';

const db = new Dexie('opengym') as Dexie & {
  plans: EntityTable<Plan, 'id'>;
  sessions: EntityTable<Session, 'id'>;
  pendingWrites: EntityTable<PendingWrite, 'id'>;
};

db.version(1).stores({
  plans: 'id, name, updatedAt',
  sessions: 'id, plan_name, date, updatedAt',
  pendingWrites: 'id, entity, type, timestamp'
});

db.version(2).stores({
  plans: 'id, name, updatedAt, synced',
  sessions: 'id, plan_name, date, updatedAt, synced',
  pendingWrites: 'id, entity, type, timestamp'
}).upgrade(tx => {
  tx.table('plans').toCollection().modify(plan => {
    if (plan.synced === undefined) plan.synced = true;
  });
  tx.table('sessions').toCollection().modify(session => {
    if (session.synced === undefined) session.synced = true;
  });
});

export { db };

export async function clearDatabase() {
  await db.plans.clear();
  await db.sessions.clear();
  await db.pendingWrites.clear();
}

export * from './plans';
export * from './sessions';
export * from './sync';
