
"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { useAppToast } from "@/components/app-shell";

import { deleteWorkout } from "@/actions/workouts";

export default function DeleteWorkoutButton({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useAppToast();
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (isDeleting) return;

    setIsDeleting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("id", id);

      await deleteWorkout(formData);

      setIsOpen(false);
      showToast("Workout deleted successfully.");
    } catch (error) {
      console.error("Failed to delete workout:", error);
      setError("Unable to delete this workout. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        isIconOnly
        variant="danger-soft"
        size="sm"
        aria-label="Delete workout"
        aria-haspopup="dialog"
        onPress={() => setIsOpen(true)}
        className="size-9 min-w-9 rounded-xl"
      >
        <Trash2 size={16} aria-hidden="true" />
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isDeleting) {
              setIsOpen(false);
            }
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-workout-title"
            aria-describedby="delete-workout-description"
            className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl"
          >
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger">
                <AlertTriangle size={22} aria-hidden="true" />
              </div>

              <div className="min-w-0 flex-1">
                <h2
                  id="delete-workout-title"
                  className="text-lg font-semibold text-foreground"
                >
                  Delete this workout?
                </h2>

                <p
                  id="delete-workout-description"
                  className="mt-2 text-sm leading-6 text-muted"
                >
                  This workout will be permanently deleted from your history.
                  This action cannot be undone.
                </p>
              </div>

              {error && (
                <p
                  role="alert"
                  aria-live="polite"
                  className="mt-4 rounded-lg border border-danger-300 p-3 text-sm text-danger"
                >
                  {error}
                </p>
              )}

              <button
                type="button"
                aria-label="Close confirmation"
                disabled={isDeleting}
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-muted transition hover:bg-background hover:text-foreground disabled:opacity-50"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="tertiary"
                isDisabled={isDeleting}
                onPress={() => {
                  setError(null);
                  setIsOpen(true);
                }}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="danger"
                isDisabled={isDeleting}
                onPress={handleDelete}
              >
                <Trash2 size={16} aria-hidden="true" />
                {isDeleting ? "Deleting..." : "Delete workout"}
              </Button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}