"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { ExerciseEditor } from "@/components/workout/exercise-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queryKeys } from "@/lib/query-keys";
import { createDefaultExercise, type WorkoutFormValues } from "@/lib/workout-form";
import { getPlans } from "@/services/plans";
import { createSession, getSessions } from "@/services/sessions";
import type { Session } from "@/services/types";

function buildExercisesFromPlan(planName: string | null, plans: Awaited<ReturnType<typeof getPlans>>) {
  const selectedPlan = plans.find((plan) => plan.name === planName);
  if (!selectedPlan) {
    return [createDefaultExercise(0)];
  }

  return selectedPlan.exercises
    .sort((a, b) => a.order_index - b.order_index)
    .map((exercise, exerciseIndex) => ({
      name: exercise.name,
      note: "",
      order_index: exerciseIndex,
      sets: Array.from({ length: exercise.sets }).map(() => ({
        reps: 8,
        weight: 0,
        rpe: undefined,
        note: "",
      })),
    }));
}

export default function WorkoutsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const plansQuery = useQuery({
    queryKey: queryKeys.plans,
    queryFn: getPlans,
  });

  const selectedPlanName = searchParams.get("plan");

  const form = useForm<WorkoutFormValues>({
    defaultValues: {
      plan_name: selectedPlanName ?? "",
      week_number: 1,
      exercises: [createDefaultExercise(0)],
    },
  });

  useEffect(() => {
    if (!plansQuery.data) {
      return;
    }

    const safePlanName =
      selectedPlanName && plansQuery.data.some((plan) => plan.name === selectedPlanName)
        ? selectedPlanName
        : (plansQuery.data[0]?.name ?? "");

    form.reset({
      plan_name: safePlanName,
      week_number: 1,
      exercises: buildExercisesFromPlan(safePlanName, plansQuery.data),
    });
  }, [form, plansQuery.data, selectedPlanName]);

  const exercisesFieldArray = useFieldArray({
    control: form.control,
    name: "exercises",
  });

  const mutation = useMutation({
    mutationFn: createSession,
    onMutate: async (newSession) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.sessions });

      const previousSessions = queryClient.getQueryData<Session[]>(queryKeys.sessions);

      const optimisticSession: Session = {
        id: `temp-${Date.now()}`,
        date: newSession.date,
        plan_name: newSession.plan_name ?? null,
        week_number: newSession.week_number,
        exercises: newSession.exercises,
      };

      queryClient.setQueryData<Session[]>(queryKeys.sessions, (current = []) => [
        optimisticSession,
        ...current,
      ]);

      return { previousSessions };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousSessions) {
        queryClient.setQueryData(queryKeys.sessions, context.previousSessions);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
      router.push("/history");
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await mutation.mutateAsync({
      plan_name: values.plan_name || undefined,
      week_number: values.week_number,
      date: new Date().toISOString(),
      exercises: values.exercises.map((exercise, exerciseIndex) => ({
        name: exercise.name,
        note: exercise.note || undefined,
        order_index: exerciseIndex,
        sets: exercise.sets.map((set) => ({
          reps: set.reps,
          weight: set.weight,
          rpe: set.rpe ?? null,
          note: set.note || undefined,
        })),
      })),
    });
  });

  const sessionsQuery = useQuery({
    queryKey: queryKeys.sessions,
    queryFn: getSessions,
  });

  const availableWeeks = useMemo(() => {
    const activePlan = selectedPlanName ?? plansQuery.data?.[0]?.name;
    if (!activePlan || !sessionsQuery.data) {
      return [1];
    }

    const weeks = Array.from(
      new Set(
        sessionsQuery.data
          .filter((session) => session.plan_name === activePlan)
          .map((session) => session.week_number),
      ),
    ).sort((a, b) => a - b);

    return weeks.length ? weeks : [1];
  }, [plansQuery.data, selectedPlanName, sessionsQuery.data]);

  const currentWeek = useWatch({ control: form.control, name: "week_number" });

  return (
    <section className="space-y-3">
      <div className="sticky top-14 z-40 overflow-x-auto border-y border-border bg-card">
        <div className="flex min-w-max">
          {plansQuery.data?.map((plan) => {
            const isSelected = plan.name === (selectedPlanName ?? plansQuery.data?.[0]?.name);
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => router.replace(`/workouts?plan=${encodeURIComponent(plan.name)}`)}
                className={`border-r border-border px-4 py-2 text-[11px] ${
                  isSelected
                    ? "bg-primary font-bold text-primary-foreground"
                    : "text-foreground"
                }`}
              >
                {plan.name.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      <form className="space-y-3" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Input
            type="text"
            aria-label="Plan name"
            placeholder="Workout title"
            className="border-border bg-card text-xs"
            {...form.register("plan_name")}
          />
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-muted-foreground">WEEK</p>
            <Input
              type="number"
              min={1}
              aria-label="Week number"
              className="border-border bg-card text-xs"
              {...form.register("week_number", { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="space-y-2">
          {exercisesFieldArray.fields.map((exerciseField, exerciseIndex) => (
            <ExerciseEditor
              key={exerciseField.id}
              index={exerciseIndex}
              control={form.control}
              register={form.register}
              setValue={form.setValue}
              canRemove={exercisesFieldArray.fields.length > 1}
              onRemove={() => exercisesFieldArray.remove(exerciseIndex)}
            />
          ))}
        </div>

        <div className="sticky bottom-0 z-30 space-y-2 bg-background pb-1">
          <div className="border-y border-border bg-card p-2">
            <div className="flex overflow-x-auto">
              {availableWeeks.map((week) => {
                const selected = week === currentWeek;
                return (
                  <button
                    key={week}
                    type="button"
                    onClick={() => form.setValue("week_number", week)}
                    className={`mr-1 border px-3 py-1 text-[11px] ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    }`}
                  >
                    WEEK {week}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  const next = Math.max(...availableWeeks) + 1;
                  form.setValue("week_number", next);
                }}
                className="border border-primary px-3 py-1 text-[11px] text-primary"
              >
                [+ WEEK {Math.max(...availableWeeks) + 1}]
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-primary text-primary"
              onClick={() =>
                exercisesFieldArray.append(createDefaultExercise(exercisesFieldArray.fields.length))
              }
            >
              [ + ADD EXERCISE ]
            </Button>
            <Button type="submit" disabled={mutation.isPending || form.formState.isSubmitting}>
              {mutation.isPending ? "[ SAVING... ]" : "[ SAVE WORKOUT ]"}
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
