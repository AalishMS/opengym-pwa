"use client";

import {
  useFieldArray,
  useWatch,
  type Control,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";

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
  const setsFieldArray = useFieldArray({
    control,
    name: `exercises.${index}.sets`,
  });

  const exerciseValues = useWatch({
    control,
    name: `exercises.${index}`,
  });

  const titleText = (exerciseValues?.name || "EXERCISE NAME").toUpperCase();
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
      <div className="space-y-1">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
        <p className="border border-primary px-2 py-0.5 text-xs font-bold text-primary">
          {index + 1}
        </p>
          <p className="min-w-0 truncate text-center text-[11px] font-bold tracking-wide text-primary">
            {titleText}
          </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={!canRemove}
          className="text-destructive"
        >
          [DEL]
        </Button>
        </div>
        <p className="min-h-4 truncate text-[10px] text-muted-foreground">{noteText ?? ""}</p>
      </div>

      <Input
        placeholder="EXERCISE NAME"
        className="border-border bg-background text-xs"
        {...register(`exercises.${index}.name`)}
      />

      <Input
        placeholder="NOTE (OPTIONAL)"
        className="border-border bg-background text-xs"
        {...register(`exercises.${index}.note`)}
      />

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
                [-]
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
                [+]
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
                [-]
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
                [+]
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
              className="h-7 border-border px-0 text-xs"
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
