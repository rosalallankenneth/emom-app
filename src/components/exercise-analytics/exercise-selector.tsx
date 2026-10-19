
"use client";

import {
  EXERCISES,
  type ExerciseValue,
} from "@/lib/exercises";

import type { ExerciseSession } from "./analytics-utils";

export default function ExerciseSelector({
  sessions,
  selectedExercise,
  onSelect,
  selectedSessionCount,
}: {
  sessions: ExerciseSession[];
  selectedExercise: ExerciseValue;
  onSelect: (exercise: ExerciseValue) => void;
  selectedSessionCount: number;
}) {
  return (
    <section aria-label="Select exercise" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Choose an exercise</h2>
        <span className="text-xs text-muted">
          {selectedSessionCount} total sessions
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {EXERCISES.map((exercise) => {
          const count = sessions.filter(
            (session) => session.exercise === exercise.value,
          ).length;

          const active = selectedExercise === exercise.value;

          return (
            <button
              key={exercise.value}
              type="button"
              onClick={() => onSelect(exercise.value)}
              aria-pressed={active}
              className={`shrink-0 rounded-xl border px-4 py-3 text-left transition-colors ${
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-surface text-foreground hover:border-foreground/50"
              }`}
            >
              <span className="block whitespace-nowrap text-sm font-semibold">
                {exercise.label}
              </span>

              <span
                className={`mt-1 block text-xs ${
                  active ? "text-background/70" : "text-muted"
                }`}
              >
                {count} {count === 1 ? "session" : "sessions"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
