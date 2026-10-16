
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import DatePickerField from "@/components/date-picker-field";
import { EXERCISES, type ExerciseValue } from "@/lib/exercises";

type Props = {
  initialExercise: string;
  initialFrom: string;
  initialTo: string;
};

export default function WorkoutHistoryFilters({
  initialExercise,
  initialFrom,
  initialTo,
}: Props) {
  const router = useRouter();
  const [exercise, setExercise] = useState(initialExercise);
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);

  return (
    <form
      action="/workouts"
      method="GET"
      className="grid items-end gap-4 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <label className="flex flex-col gap-2 text-sm font-medium">
        Exercise
        <select
          name="exercise"
          value={exercise}
          onChange={(event) => setExercise(event.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
        >
          <option value="">All exercises</option>
          {EXERCISES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          From
        </label>

        <DatePickerField
          name="from"
          value={from}
          onChange={setFrom}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          To
        </label>

        <DatePickerField
          name="to"
          value={to}
          onChange={setTo}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="h-11 flex-1 rounded-xl bg-foreground px-4 text-sm font-semibold text-background"
        >
          Apply filters
        </button>

        <button
          type="button"
          onClick={() => {
            setExercise("");
            setFrom("");
            setTo("");
            router.push("/workouts");
          }}
          className="flex h-11 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium"
        >
          Reset
        </button>
      </div>
    </form>
  );
}
