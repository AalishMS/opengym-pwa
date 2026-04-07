import Link from "next/link";

import type { Plan } from "@/services/types";

type PlanCardProps = {
  plan: Plan;
  index: number;
};

export function PlanCard({ plan, index }: PlanCardProps) {
  return (
    <Link
      href={`/workouts?plan=${encodeURIComponent(plan.name)}`}
      className="flex min-h-32 flex-col border border-border bg-card p-3"
    >
      <div className="flex">
        <span className="border border-primary px-1.5 py-0.5 text-[10px] text-primary">
          [{index + 1}]
        </span>
      </div>
      <div className="mt-auto space-y-1">
        <p className="line-clamp-2 text-xs font-bold tracking-wide">{plan.name.toUpperCase()}</p>
        <p className="text-[10px] text-muted-foreground">
          {plan.exercises.length} EXERCISES
        </p>
      </div>
    </Link>
  );
}
