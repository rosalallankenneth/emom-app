
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import DatePickerField from "@/components/date-picker-field";
import { ALL_EXERCISES } from "@/lib/exercises";

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
      className="grid grid-cols-2 items-end gap-3 rounded-2xl border border-border bg-surface p-3 sm:gap-4 sm:p-4 lg:grid-cols-4"
    >
      <label className="col-span-2 flex flex-col gap-1.5 text-xs font-medium sm:gap-2 sm:text-sm lg:col-span-1">
        Exercise
        <select
          name="exercise"
          value={exercise}
          onChange={(event) => setExercise(event.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
        >
          <option value="">All exercises</option>
          {ALL_EXERCISES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <div className="space-y-1.5 sm:space-y-2">
        <label className="block text-xs font-medium sm:text-sm">
          From
        </label>

        <DatePickerField
          name="from"
          value={from}
          onChange={setFrom}
        />
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <label className="block text-xs font-medium sm:text-sm">
          To
        </label>

        <DatePickerField
          name="to"
          value={to}
          onChange={setTo}
        />
      </div>

      <div className="col-span-2 flex gap-2 lg:col-span-1">
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
