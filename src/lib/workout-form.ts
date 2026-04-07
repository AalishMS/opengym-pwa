export type WorkoutFormValues = {
  plan_name: string;
  week_number: number;
  exercises: {
    name: string;
    note: string;
    order_index: number;
    sets: {
      reps: number;
      weight: number;
      rpe?: number;
      note?: string;
    }[];
  }[];
};

export function createDefaultExercise(index: number) {
  return {
    name: "",
    note: "",
    order_index: index,
    sets: [{ reps: 8, weight: 20, rpe: 7 }],
  };
}
