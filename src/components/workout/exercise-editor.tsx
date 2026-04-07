"use client";

import { useState } from "react";
import {
  useFieldArray,
  useWatch,
  type Control,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";
import { FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WorkoutFormValues } from "@/lib/workout-form";

type ExerciseEditorProps = {
  index: number;
  control: Control<WorkoutFormValues>;
  register: UseFormRegister<WorkoutFormValues>;
  setValue: UseFormSetValue<WorkoutFormValues>;
  canRemove: boolean;
  onRemove: () => void;
};

export function ExerciseEditor({
  index,
  control,
  register,
  setValue,
  canRemove,
  onRemove,
}: ExerciseEditorProps) {
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const setsFieldArray = useFieldArray({
    control,
    name: `exercises.${index}.sets`,
  });

  const exerciseValues = useWatch({
    control,
    name: `exercises.${index}`,
  });
  const noteText = exerciseValues?.note?.trim();

  function stepSetValue(setIndex: number, field: "weight" | "reps", delta: 1 | -1) {
    const currentValue = exerciseValues?.sets?.[setIndex]?.[field];
    const safeCurrent = typeof currentValue === "number" && Number.isFinite(currentValue) ? currentValue : 0;
    const minValue = field === "reps" ? 1 : 0;
    const nextValue = Math.max(minValue, safeCurrent + delta);
    setValue(`exercises.${index}.sets.${setIndex}.${field}`, nextValue, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
  }

  return (
    <div className="space-y-3 border border-border bg-card p-3">
      <div>
        <div className="flex items-center gap-2">
          <p className="border border-primary px-2 py-0.5 text-xs font-bold text-primary">
            {index + 1}
          </p>
          <div className="min-w-0 flex-1">
            <Input
              placeholder="EXERCISE NAME"
              className="h-auto min-w-0 truncate border-0 bg-transparent p-0 text-[11px] font-bold uppercase tracking-wide text-primary shadow-none placeholder:text-primary/60 focus-visible:ring-0"
              {...register(`exercises.${index}.name`)}
            />
          </div>
          <div className="relative">
            <button
              type="button"
              aria-label={isNoteEditorOpen ? "Close exercise note" : "Open exercise note"}
              aria-expanded={isNoteEditorOpen}
              onClick={() => setIsNoteEditorOpen((current) => !current)}
              className="peer inline-flex size-5 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <FileText className="size-3.5" />
            </button>
            <div className="pointer-events-none absolute right-0 top-6 z-20 w-52 rounded border border-border bg-card p-2 text-[10px] text-muted-foreground opacity-0 shadow-sm transition-opacity peer-hover:opacity-100 peer-focus-visible:opacity-100">
              {noteText || "NO NOTE ADDED"}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={!canRemove}
            className="ml-auto text-destructive"
          >
            [DEL]
          </Button>
        </div>
        {isNoteEditorOpen ? (
          <Input
            autoFocus
            placeholder="ADD NOTE"
            className="mt-2 h-auto border-border bg-transparent text-[10px] text-muted-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
            {...register(`exercises.${index}.note`)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                setIsNoteEditorOpen(false);
              }
            }}
          />
        ) : null}
      </div>

      <div className="space-y-1.5">
        <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,1fr)_32px] gap-1 px-1 text-[10px] uppercase tracking-wide text-muted-foreground">
          <p className="text-center">Weight</p>
          <p className="text-center">Reps</p>
          <p className="text-center">RPE</p>
          <span aria-hidden="true" />
        </div>

        {setsFieldArray.fields.map((setField, setIndex) => (
          <div
            key={setField.id}
            className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,1fr)_32px] gap-1 border border-border p-1"
          >
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-0.5">
              <Button
                type="button"
                variant="outline"
                size="xs"
                className="h-7 border-border px-1.5 text-[10px]"
                onClick={() => stepSetValue(setIndex, "weight", -1)}
              >
                -
              </Button>
              <Input
                type="number"
                min={0}
                step={1}
                className="h-7 px-1 text-center text-[11px]"
                {...register(`exercises.${index}.sets.${setIndex}.weight`, {
                  valueAsNumber: true,
                })}
              />
              <Button
                type="button"
                variant="outline"
                size="xs"
                className="h-7 border-border px-1.5 text-[10px]"
                onClick={() => stepSetValue(setIndex, "weight", 1)}
              >
                +
              </Button>
            </div>

            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-0.5">
              <Button
                type="button"
                variant="outline"
                size="xs"
                className="h-7 border-border px-1.5 text-[10px]"
                onClick={() => stepSetValue(setIndex, "reps", -1)}
              >
                -
              </Button>
              <Input
                type="number"
                min={1}
                step={1}
                className="h-7 px-1 text-center text-[11px]"
                {...register(`exercises.${index}.sets.${setIndex}.reps`, {
                  valueAsNumber: true,
                })}
              />
              <Button
                type="button"
                variant="outline"
                size="xs"
                className="h-7 border-border px-1.5 text-[10px]"
                onClick={() => stepSetValue(setIndex, "reps", 1)}
              >
                +
              </Button>
            </div>

            <Input
              type="number"
              min={1}
              max={10}
              className="h-7 px-1 text-center text-[11px]"
              {...register(`exercises.${index}.sets.${setIndex}.rpe`, {
                valueAsNumber: true,
              })}
            />
            <Button
              type="button"
              variant="outline"
              className="h-7 border-border px-0 text-xs text-destructive"
              onClick={() => setsFieldArray.remove(setIndex)}
              disabled={setsFieldArray.fields.length === 1}
            >
              -
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="border-primary text-xs text-primary"
        onClick={() => setsFieldArray.append({ reps: 8, weight: 20, rpe: 7 })}
      >
        [ + ADD SET ]
      </Button>
    </div>
  );
}
