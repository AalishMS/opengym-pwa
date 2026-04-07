"use client";

import { useFieldArray, type Control, type UseFormRegister } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WorkoutFormValues } from "@/lib/workout-form";

type ExerciseEditorProps = {
  index: number;
  control: Control<WorkoutFormValues>;
  register: UseFormRegister<WorkoutFormValues>;
  canRemove: boolean;
  onRemove: () => void;
};

export function ExerciseEditor({
  index,
  control,
  register,
  canRemove,
  onRemove,
}: ExerciseEditorProps) {
  const setsFieldArray = useFieldArray({
    control,
    name: `exercises.${index}.sets`,
  });

  return (
    <div className="space-y-3 border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="border border-primary px-2 py-0.5 text-xs font-bold text-primary">
          {index + 1}
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

      <div className="space-y-2">
        {setsFieldArray.fields.map((setField, setIndex) => (
          <div
            key={setField.id}
            className="grid grid-cols-4 gap-1 border border-border p-1"
          >
            <Input
              type="number"
              min={1}
              placeholder="Reps"
              className="h-8 text-xs"
              {...register(`exercises.${index}.sets.${setIndex}.reps`, {
                valueAsNumber: true,
              })}
            />
            <Input
              type="number"
              min={0}
              step="0.5"
              placeholder="Weight"
              className="h-8 text-xs"
              {...register(`exercises.${index}.sets.${setIndex}.weight`, {
                valueAsNumber: true,
              })}
            />
            <Input
              type="number"
              min={1}
              max={10}
              placeholder="RPE"
              className="h-8 text-xs"
              {...register(`exercises.${index}.sets.${setIndex}.rpe`, {
                valueAsNumber: true,
              })}
            />
            <Button
              type="button"
              variant="outline"
              className="h-8 border-border px-0 text-xs"
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
