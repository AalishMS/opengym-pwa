import { http } from "@/services/http";
import type { Plan } from "@/services/types";

export async function getPlans() {
  const { data } = await http.get<Plan[]>("/plans");
  return data;
}

type PlanCreatePayload = {
  name: string;
  exercises: {
    name: string;
    sets: number;
    order_index: number;
  }[];
};

export async function createPlan(payload: PlanCreatePayload) {
  const { data } = await http.post<Plan>("/plans", payload);
  return data;
}

export async function deletePlan(planId: string) {
  await http.delete(`/plans/${planId}`);
}
