"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { queryKeys } from "@/lib/query-keys";
import { getPlans } from "@/services/plans";
import { getSessions } from "@/services/sessions";

export default function ExercisesPage() {
  const [search, setSearch] = useState("");

  const plansQuery = useQuery({
    queryKey: queryKeys.plans,
    queryFn: getPlans,
  });

  const sessionsQuery = useQuery({
    queryKey: queryKeys.sessions,
    queryFn: getSessions,
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
