export interface PlanExercise {
  id: string;
  name: string;
  sets: number;
  order_index: number;
}

export interface Plan {
  id: string;
  name: string;
  exercises: PlanExercise[];
  synced: boolean;
  updatedAt: string;
}

export interface PlanCreatePayload {
  name: string;
  exercises: Omit<PlanExercise, 'id'>[];
}

export interface SessionSet {
  id: string;
  reps: number;
  weight: number;
  rpe?: number | null;
  note?: string | null;
}

export interface SessionExercise {
  id: string;
  name: string;
  note?: string | null;
  sets: SessionSet[];
  order_index: number;
}

export interface Session {
  id: string;
  plan_name?: string | null;
  date: string;
  week_number: number;
  exercises: SessionExercise[];
  synced: boolean;
  updatedAt: string;
}

export interface SessionCreatePayload {
  plan_name?: string;
  date: string;
  week_number: number;
  exercises: {
    name: string;
    note?: string | null;
    sets: { reps: number; weight: number; rpe?: number | null; note?: string | null }[];
    order_index: number;
  }[];
}

export interface PendingWrite {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'plan' | 'session';
  payload: unknown;
  timestamp: number;
  retries: number;
}

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface ApiError {
  detail: string;
}
