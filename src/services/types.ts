export type SessionSet = {
  id?: string;
  reps: number;
  weight: number;
  rpe?: number | null;
  note?: string | null;
};

export type SessionExercise = {
  id?: string;
  name: string;
  note?: string | null;
  sets: SessionSet[];
  order_index: number;
};

export type Session = {
  id: string;
  plan_name?: string | null;
  date: string;
  week_number: number;
  exercises: SessionExercise[];
};

export type SessionCreatePayload = {
  plan_name?: string;
  date: string;
  week_number: number;
  exercises: SessionExercise[];
};

export type PlanExercise = {
  id: string;
  name: string;
  sets: number;
  order_index: number;
};

export type Plan = {
  id: string;
  name: string;
  exercises: PlanExercise[];
};
