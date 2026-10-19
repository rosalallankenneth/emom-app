
"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { Button, Modal, useOverlayState } from "@heroui/react";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  updateWorkout,
  type UpdateWorkoutState,
} from "@/actions/workouts";
import { EXERCISES, type ExerciseValue } from "@/lib/exercises";
import DatePickerField from "./date-picker-field";

type WorkoutToEdit = {
  id: string;
  exercise: ExerciseValue;
  workoutDate: string;
  durationMinutes: number;
  repsPerMinute: number;
  externalLoadKg: number | null;
  notes: string | null;
};

const initialState: UpdateWorkoutState = {
  success: false,
  message: "",
};

export default function EditWorkoutModal({
  workout,
}: {
  workout: WorkoutToEdit;
}) {
  const modalState = useOverlayState({ defaultOpen: false });

  const closeModal = useCallback(() => {
    modalState.close();
  }, [modalState]);

  return (
    <Modal state={modalState}>
      <Button
        isIconOnly
        variant="ghost"
        size="sm"
        aria-label={`Edit ${workout.exercise.replaceAll("_", " ").toLowerCase()} workout`}
        onPress={modalState.open}
        className="size-9 min-w-9 rounded-xl text-muted hover:bg-background hover:text-foreground"
      >
        <Pencil size={16} aria-hidden="true" />
      </Button>

      <Modal.Backdrop variant="blur" isDismissable>
        <Modal.Container size="lg" className="max-h-[85dvh]">
          <Modal.Dialog
            aria-label="Edit workout"
            className="flex max-h-[85dvh] flex-col overflow-hidden"
          >
            <Modal.Header className="shrink-0 border-b border-border px-6 py-5">
              <div>
                <Modal.Heading className="text-xl font-semibold">
                  Edit workout
                </Modal.Heading>
                <p className="mt-1 text-sm text-muted">
                  Update the details of your session.
                </p>
              </div>
              <Modal.CloseTrigger />
            </Modal.Header>

            <Modal.Body className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
              {modalState.isOpen && (
                <EditWorkoutForm
                  key={workout.id}
                  workout={workout}
                  onSuccess={closeModal}
                />
              )}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

function EditWorkoutForm({
  workout,
  onSuccess,
}: {
  workout: WorkoutToEdit;
  onSuccess: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    updateWorkout,
    initialState,
  );

  const [exercise, setExercise] = useState<ExerciseValue>(
    workout.exercise,
  );
  const [workoutDate, setWorkoutDate] = useState(workout.workoutDate);
  const [externalLoadKg, setExternalLoadKg] = useState(
    workout.externalLoadKg?.toString() ?? "",
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      onSuccess();
      router.refresh();
    }
  }, [state.success, onSuccess, router]);

  return (
    <form
      action={formAction}
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      {/* Only this section scrolls. */}
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-6 py-5">
        <input type="hidden" name="id" value={workout.id} />

        <label className="block text-sm font-medium">
          Exercise
          <select
            name="exercise"
            value={exercise}
            onChange={(event) =>
              setExercise(event.target.value as ExerciseValue)
            }
            required
            className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3"
          >
            {EXERCISES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Workout date
          </label>

          <DatePickerField
            name="workoutDate"
            value={workoutDate}
            onChange={setWorkoutDate}
          />
        </div>

        <label className="block text-sm font-medium">
          Duration
          <select
            name="durationMinutes"
            defaultValue={workout.durationMinutes}
            required
            className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3"
          >
            {Array.from({ length: 21 }, (_, index) => index + 10).map(
              (minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} minutes
                </option>
              ),
            )}
          </select>
        </label>

        <label className="block text-sm font-medium">
          Reps per minute
          <input
            type="number"
            name="repsPerMinute"
            min={0}
            max={1000}
            step={1}
            defaultValue={workout.repsPerMinute}
            required
            className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3"
          />
          <span className="mt-1 block text-xs font-normal text-muted">
            Total reps = duration × reps per minute.
          </span>
        </label>

        <label className="block text-sm font-medium">
          External load (kg)
          <input
            type="number"
            name="externalLoadKg"
            min={0.01}
            max={1000}
            step="any"
            value={externalLoadKg}
            onChange={(event) => setExternalLoadKg(event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3"
            placeholder="Optional"
          />
          <span className="mt-1 block text-xs font-normal text-muted">
            Leave empty if no external load was used.
          </span>
        </label>

        <label className="block text-sm font-medium">
          Notes
          <textarea
            name="notes"
            maxLength={1000}
            rows={4}
            defaultValue={workout.notes ?? ""}
            className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-3"
            placeholder="Optional notes about this session..."
          />
        </label>

        {state.message && !state.success && (
          <p
            role="alert"
            aria-live="polite"
            className="text-sm text-red-600"
          >
            {state.message}
          </p>
        )}
      </div>

      {/* This footer stays outside the scrollable section. */}
      <div className="flex shrink-0 justify-end gap-3 border-t border-border px-6 py-4">
        <Button
          type="button"
          variant="outline"
          onPress={onSuccess}
          isDisabled={isPending}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="primary"
          isPending={isPending}
          isDisabled={isPending}
        >
          Save changes
        </Button>
      </div>
    </form>
  );
}