"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/lib/query-keys";
import { getPlans, createPlan } from "@/services/plans";
import { getSessions } from "@/services/sessions";

type PlanExerciseInput = {
  name: string;
  sets: number;
};

type PlanFormData = {
  name: string;
  exercises: PlanExerciseInput[];
};

export default function ExercisesPage() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(searchParams.get("create") === "true");
  const [formData, setFormData] = useState<PlanFormData>({ name: "", exercises: [] });

  useEffect(() => {
    setShowCreate(searchParams.get("create") === "true");
  }, [searchParams]);

  const plansQuery = useQuery({
    queryKey: queryKeys.plans,
    queryFn: getPlans,
  });

  const sessionsQuery = useQuery({
    queryKey: queryKeys.sessions,
    queryFn: getSessions,
  });

  const createMutation = useMutation({
    mutationFn: createPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.plans });
      setShowCreate(false);
      setFormData({ name: "", exercises: [] });
    },
  });

  const exercises = useMemo(() => {
    const namesFromPlans =
      plansQuery.data?.flatMap((plan) => plan.exercises.map((exercise) => exercise.name)) ??
      [];

    const namesFromSessions =
      sessionsQuery.data?.flatMap((session) =>
        session.exercises.map((exercise) => exercise.name),
      ) ?? [];

    const allNames = [...namesFromPlans, ...namesFromSessions].map((name) =>
      name.trim(),
    );

    const unique = [...new Set(allNames)].filter(Boolean);
    unique.sort((a, b) => a.localeCompare(b));

    if (!search.trim()) {
      return unique;
    }

    const needle = search.toLowerCase();
    return unique.filter((name) => name.toLowerCase().includes(needle));
  }, [plansQuery.data, search, sessionsQuery.data]);

  const handleAddExercise = () => {
    setFormData((prev) => ({
      ...prev,
      exercises: [...prev.exercises, { name: "", sets: 3 }],
    }));
  };

  const handleRemoveExercise = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const handleExerciseChange = (index: number, field: keyof PlanExerciseInput, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) =>
        i === index ? { ...ex, [field]: value } : ex
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.exercises.length === 0) return;
    
    createMutation.mutate({
      name: formData.name,
      exercises: formData.exercises
        .filter((ex) => ex.name.trim())
        .map((ex, idx) => ({
          name: ex.name.trim(),
          sets: ex.sets,
          order_index: idx,
        })),
    });
  };

  if (showCreate) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Create Plan</h1>
          <Button variant="ghost" onClick={() => setShowCreate(false)}>
            Cancel
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground">PLAN NAME</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., PUSH DAY"
              className="mt-1"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground">EXERCISES</label>
            {formData.exercises.map((exercise, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={exercise.name}
                  onChange={(e) => handleExerciseChange(index, "name", e.target.value)}
                  placeholder="Exercise name"
                  className="flex-1"
                />
                <Input
                  type="number"
                  min={1}
                  value={exercise.sets}
                  onChange={(e) => handleExerciseChange(index, "sets", parseInt(e.target.value) || 1)}
                  className="w-16"
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleRemoveExercise(index)}
                  className="text-destructive"
                >
                  X
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={handleAddExercise} className="w-full">
              [ + ADD EXERCISE ]
            </Button>
          </div>

          <Button
            type="submit"
            disabled={createMutation.isPending || !formData.name.trim() || formData.exercises.length === 0}
            className="w-full"
          >
            {createMutation.isPending ? "[ SAVING... ]" : "[ CREATE PLAN ]"}
          </Button>
        </form>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Exercise Library</h1>

      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search exercise names"
      />

      {plansQuery.isLoading || sessionsQuery.isLoading ? (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            Loading exercises...
          </CardContent>
        </Card>
      ) : null}

      {plansQuery.isError || sessionsQuery.isError ? (
        <Card>
          <CardContent className="py-6 text-sm text-destructive">
            Could not load exercises from plans and history.
          </CardContent>
        </Card>
      ) : null}

      {exercises.map((name) => (
        <Card key={name}>
          <CardHeader className="py-4">
            <CardTitle className="text-base">{name}</CardTitle>
          </CardHeader>
        </Card>
      ))}

      {!plansQuery.isLoading && !sessionsQuery.isLoading && exercises.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            No exercises match your search.
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}