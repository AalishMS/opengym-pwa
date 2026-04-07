"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import type { Session } from "@/services/types";

type HistorySessionCardProps = {
  session: Session;
  onEdit: () => void;
  onDelete: () => void;
};

export function HistorySessionCard({ session, onEdit, onDelete }: HistorySessionCardProps) {
  const [expanded, setExpanded] = useState(false);

  const summary = useMemo(() => {
    const totalSets = session.exercises.reduce((acc, exercise) => acc + exercise.sets.length, 0);
    const totalVolume = session.exercises.reduce(
      (acc, exercise) =>
        acc + exercise.sets.reduce((setTotal, set) => setTotal + set.reps * set.weight, 0),
      0,
    );

    return {
      totalSets,
      totalVolume,
    };
  }, [session.exercises]);

  const date = new Date(session.date);

  return (
    <article className="border border-border bg-card">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="w-full p-3 text-left"
      >
        <div className="flex items-start gap-2">
          <span className="border border-primary px-1.5 py-0.5 text-[10px] text-primary">
            {date.getDate()}/{date.getMonth() + 1}/{date.getFullYear()}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onEdit();
              }}
              className="text-[10px] text-primary"
            >
              [EDIT]
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
              className="text-[10px] text-destructive"
            >
              [DEL]
            </button>
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </div>
        </div>
        <p className="mt-2 text-sm font-bold">{(session.plan_name ?? "CUSTOM WORKOUT").toUpperCase()}</p>
        <p className="mt-1 text-[10px] text-muted-foreground">
          WEEK {session.week_number} • {session.exercises.length} EXERCISES • {summary.totalSets} SETS • {Math.round(summary.totalVolume)}KG
        </p>
      </button>

      {expanded ? (
        <div className="border-t border-border p-3">
          <div className="space-y-3">
            {session.exercises.map((exercise, exerciseIndex) => (
              <div key={`${exercise.name}-${exerciseIndex}`}>
                <p className="text-xs font-bold">{exercise.name.toUpperCase()}</p>
                {exercise.note ? <p className="mt-1 text-[10px] text-muted-foreground">{exercise.note}</p> : null}
                <div className="mt-1 space-y-1">
                  {exercise.sets.map((set, setIndex) => (
                    <p key={`${setIndex}-${set.reps}-${set.weight}`} className="text-[10px]">
                      SET {setIndex + 1}: {set.weight}KG x {set.reps} REPS
                      {set.rpe ? ` • RPE ${set.rpe}` : ""}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
