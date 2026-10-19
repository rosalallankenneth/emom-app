
"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@heroui/react";

import {
  createWorkout,
  type WorkoutFormState,
} from "../actions/workouts";
import { EXERCISES } from "@/lib/exercises";
import DatePickerField from "@/components/date-picker-field";

const initialState: WorkoutFormState = {
  success: false,
  message: "",
};

function getLocalDate(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;

  return new Date(now.getTime() - offset)
    .toISOString()
    .slice(0, 10);
}

const inputClass =
  "w-full rounded-lg border border-default-300 bg-background px-3 py-2 text-sm outline-none focus:border-primary";

const labelClass = "mb-1.5 block text-sm font-medium";

type WorkoutFormProps = {
  onSuccess?: (message: string) => void;
};

export default function WorkoutForm({
  onSuccess,
}: WorkoutFormProps) {
  const [state, formAction, pending] = useActionState(
    createWorkout,
    initialState,
  );

  const onSuccessRef = useRef(onSuccess);

  const [exercise, setExercise] = useState("PULL_UPS");
  const [duration, setDuration] = useState(20);
  const [workoutDate, setWorkoutDate] = useState("");

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    if (state.success) {
      onSuccessRef.current?.(state.message);
    }
  }, [state]);

  useEffect(() => {
    setWorkoutDate(getLocalDate());
  }, []);

  return (
    <form
      action={formAction}
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      {/* The only scrollable area in the modal. */}
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-6 py-5">
        <div>
          <label className={labelClass} htmlFor="exercise">
            Exercise
          </label>

          <select
            id="exercise"
            name="exercise"
            value={exercise}
            onChange={(event) => setExercise(event.target.value)}
            className={inputClass}
            required
          >
            {EXERCISES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className={labelClass} htmlFor="workoutDate">
              Workout date
            </label>

            <DatePickerField
              name="workoutDate"
              value={workoutDate}
              onChange={setWorkoutDate}
              required
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="durationMinutes">
              Duration
            </label>

            <select
              id="durationMinutes"
              name="durationMinutes"
              value={duration}
              onChange={(event) =>
                setDuration(Number(event.target.value))
              }
              className={inputClass}
            >
              {Array.from({ length: 21 }, (_, index) => index + 10).map(
                (minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} minutes
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="repsPerMinute">
            Reps per minute
          </label>

          <input
            id="repsPerMinute"
            name="repsPerMinute"
            type="number"
            min="0"
            max="1000"
            step="1"
            inputMode="numeric"
            className={inputClass}
            placeholder="e.g. 5"
            required
          />

          <p className="mt-1 text-xs text-default-500">
            Enter the number of reps completed each minute throughout
            this session.
          </p>
        </div>

        <div>
          <label className={labelClass} htmlFor="externalLoadKg">
            External load (kg)
          </label>

          <input
            id="externalLoadKg"
            name="externalLoadKg"
            type="number"
            min="0.1"
            max="1000"
            step="0.1"
            placeholder="e.g. 20"
            className={inputClass}
          />

          <p className="mt-1 text-xs text-default-500">
            Enter the total external load used for this workout.
          </p>
        </div>

        <div>
          <label className={labelClass} htmlFor="notes">
            Notes{" "}
            <span className="font-normal text-default-500">
              (optional)
            </span>
          </label>

          <textarea
            id="notes"
            name="notes"
            maxLength={1000}
            rows={3}
            placeholder="How did the workout feel?"
            className={inputClass}
          />
        </div>

        {state.message && !state.success && (
          <p
            role="alert"
            aria-live="polite"
            className="rounded-lg border border-danger-300 p-3 text-sm"
          >
            {state.message}
          </p>
        )}
      </div>

      {/* Fixed footer: never scrolls with the fields. */}
      <div className="flex shrink-0 justify-end border-t border-default-200 px-6 py-4">
        <Button
          type="submit"
          variant="primary"
          isDisabled={pending}
        >
          {pending ? "Saving workout..." : "Save workout"}
        </Button>
      </div>
    </form>
  );
}
