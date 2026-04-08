import { openDB, type IDBPDatabase } from "idb";
import type { WorkoutFormValues } from "@/lib/workout-form";

const DB_NAME = "opengym-workouts";
const DB_VERSION = 1;
const STORE_NAME = "draft-workouts";

let dbPromise: Promise<IDBPDatabase> | null = null;

async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

export interface DraftWorkout {
  id: string;
  plan_name: string;
  week_number: number;
  exercises: WorkoutFormValues["exercises"];
  updatedAt: string;
}

export async function saveDraft(workout: DraftWorkout): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, workout);
}

export async function getDraft(id: string): Promise<DraftWorkout | undefined> {
  const db = await getDB();
  return db.get(STORE_NAME, id);
}

export async function getAllDrafts(): Promise<DraftWorkout[]> {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

export async function deleteDraft(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}