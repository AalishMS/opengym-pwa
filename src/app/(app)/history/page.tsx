"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { HistorySessionCard } from "@/components/opengym/history-session-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queryKeys } from "@/lib/query-keys";
import { deleteSession, getSessions, updateSession } from "@/services/sessions";
import type { Session } from "@/services/types";

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Session | null>(null);
  const [planName, setPlanName] = useState("");
  const [weekNumber, setWeekNumber] = useState(1);

  const sessionsQuery = useQuery({
    queryKey: queryKeys.sessions,
    queryFn: getSessions,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSession,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ sessionId, session }: { sessionId: string; session: Session }) =>
      updateSession(sessionId, {
        date: session.date,
        plan_name: planName,
        week_number: weekNumber,
        exercises: session.exercises,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
      setEditing(null);
    },
  });

  const sortedSessions = useMemo(
    () => [...(sessionsQuery.data ?? [])].sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    [sessionsQuery.data],
  );

  if (sessionsQuery.isLoading) {
    return (
      <section className="flex flex-1 items-center justify-center">
        <p className="text-sm text-primary">&gt; LOADING SESSIONS...</p>
      </section>
    );
  }

  if (sessionsQuery.isError) {
    return (
      <section className="pt-4">
        <div className="border border-destructive bg-destructive/10 p-4 text-center">
          <p className="text-sm font-bold text-destructive">&gt; ERROR</p>
          <p className="mt-2 text-xs text-destructive">Could not load workout history.</p>
        </div>
      </section>
    );
  }

  if (!sortedSessions.length) {
    return (
      <section className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">&gt; NO SESSIONS FOUND</p>
          <p className="mt-2 text-xs text-muted-foreground">Complete a workout to see it here</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="space-y-2">
        <p className="text-sm font-bold text-primary">&gt; WORKOUT HISTORY</p>
        {sortedSessions.map((session) => (
          <HistorySessionCard
            key={session.id}
            session={session}
            onEdit={() => {
              setEditing(session);
              setPlanName(session.plan_name ?? "");
              setWeekNumber(session.week_number);
            }}
            onDelete={() => {
              if (window.confirm("Delete this workout session?")) {
                deleteMutation.mutate(session.id);
              }
            }}
          />
        ))}
      </section>

      {editing ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm border border-border bg-card p-4">
            <p className="text-sm font-bold text-primary">&gt; EDIT WORKOUT</p>
            <div className="mt-3 space-y-3">
              <div>
                <p className="mb-1 text-[10px] text-muted-foreground">PLAN NAME</p>
                <Input value={planName} onChange={(event) => setPlanName(event.target.value)} />
              </div>
              <div>
                <p className="mb-1 text-[10px] text-muted-foreground">WEEK NUMBER</p>
                <Input
                  type="number"
                  min={1}
                  value={weekNumber}
                  onChange={(event) => setWeekNumber(Number(event.target.value) || 1)}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>
                [CANCEL]
              </Button>
              <Button
                onClick={() => {
                  if (editing) {
                    updateMutation.mutate({ sessionId: editing.id, session: editing });
                  }
                }}
              >
                [SAVE]
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
