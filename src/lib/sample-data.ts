import type { SessionCreatePayload } from "@/services/types";

export const samplePlans = [
  {
    name: "Sample - Push Strength",
    exercises: [
      { name: "Barbell Bench Press", sets: 4, order_index: 0 },
      { name: "Incline Dumbbell Press", sets: 3, order_index: 1 },
      { name: "Seated Dumbbell Shoulder Press", sets: 3, order_index: 2 },
      { name: "Cable Lateral Raise", sets: 3, order_index: 3 },
      { name: "Rope Tricep Pushdown", sets: 3, order_index: 4 },
    ],
  },
  {
    name: "Sample - Pull Hypertrophy",
    exercises: [
      { name: "Weighted Pull-up", sets: 3, order_index: 0 },
      { name: "Chest Supported Row", sets: 3, order_index: 1 },
      { name: "Wide Grip Lat Pulldown", sets: 3, order_index: 2 },
      { name: "Face Pull", sets: 3, order_index: 3 },
      { name: "Incline Dumbbell Curl", sets: 3, order_index: 4 },
    ],
  },
  {
    name: "Sample - Legs Performance",
    exercises: [
      { name: "Back Squat", sets: 4, order_index: 0 },
      { name: "Romanian Deadlift", sets: 3, order_index: 1 },
      { name: "Leg Press", sets: 3, order_index: 2 },
      { name: "Seated Hamstring Curl", sets: 3, order_index: 3 },
      { name: "Standing Calf Raise", sets: 3, order_index: 4 },
    ],
  },
] as const;

export const sampleSessions: SessionCreatePayload[] = [
  {
    date: new Date().toISOString(),
    plan_name: "Sample - Push Strength",
    week_number: 1,
    exercises: [
      {
        name: "Barbell Bench Press",
        note: null,
        order_index: 0,
        sets: [
          { reps: 6, weight: 67.5, rpe: 7, note: null },
          { reps: 6, weight: 67.5, rpe: 8, note: null },
          { reps: 5, weight: 70, rpe: 9, note: null },
        ],
      },
      {
        name: "Incline Dumbbell Press",
        note: null,
        order_index: 1,
        sets: [
          { reps: 10, weight: 24, rpe: 7, note: null },
          { reps: 9, weight: 24, rpe: 8, note: null },
          { reps: 8, weight: 26, rpe: 9, note: null },
        ],
      },
    ],
  },
  {
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    plan_name: "Sample - Pull Hypertrophy",
    week_number: 1,
    exercises: [
      {
        name: "Weighted Pull-up",
        note: null,
        order_index: 0,
        sets: [
          { reps: 8, weight: 7.5, rpe: 7, note: null },
          { reps: 8, weight: 7.5, rpe: 8, note: null },
          { reps: 6, weight: 10, rpe: 9, note: null },
        ],
      },
    ],
  },
];
