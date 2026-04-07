"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { PlanCard } from "@/components/opengym/plan-card";
import { queryKeys } from "@/lib/query-keys";
import { getPlans } from "@/services/plans";

export default function HomePage() {
  const plansQuery = useQuery({
    queryKey: queryKeys.plans,
    queryFn: getPlans,
  });

  if (plansQuery.isLoading) {
    return (
      <section className="flex flex-1 items-center justify-center">
        <div className="space-y-2 text-center">
          <p className="text-sm text-primary">&gt; LOADING PLANS...</p>
        </div>
      </section>
    );
  }

  if (plansQuery.isError) {
    return (
      <section className="pt-4">
        <div className="border border-destructive bg-destructive/10 p-4 text-center">
          <p className="text-sm font-bold text-destructive">&gt; ERROR</p>
          <p className="mt-2 text-xs text-destructive">Could not load workout plans.</p>
        </div>
      </section>
    );
  }

  if (!plansQuery.data?.length) {
    return (
      <section className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">&gt; NO PLANS FOUND</p>
          <p className="mt-2 text-xs text-muted-foreground">Create your first workout plan</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {plansQuery.data.map((plan, index) => (
          <PlanCard key={plan.id} plan={plan} index={index} />
        ))}
      </div>
      <Link
        href="/workouts"
        className="fixed bottom-20 right-4 border border-primary bg-primary px-3 py-2 text-sm font-bold text-primary-foreground"
      >
        [ + ]
      </Link>
    </section>
  );
}
