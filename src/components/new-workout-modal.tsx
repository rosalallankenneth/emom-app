
"use client";

import { Button, Modal, useOverlayState } from "@heroui/react";
import { Dumbbell } from "lucide-react";

import WorkoutForm from "@/components/workout-form";

type NewWorkoutModalProps = {
  onSaved?: (message: string) => void;
};

export default function NewWorkoutModal({
  onSaved,
}: NewWorkoutModalProps) {
  const modalState = useOverlayState({ defaultOpen: false });

  return (
    <Modal state={modalState}>
      <Button
        onPress={modalState.open}
        variant="primary"
        aria-label="New workout"
        className="fixed bottom-6 right-6 z-40 flex size-14 min-w-14 items-center justify-center rounded-full p-0 shadow-lg sm:bottom-8 sm:right-8 sm:h-14 sm:w-auto sm:min-w-0 sm:gap-3 sm:rounded-2xl sm:px-7"
      >
        <Dumbbell size={24} strokeWidth={1.8} aria-hidden="true" />
        <span className="hidden sm:inline font-bold">New workout</span>
      </Button>

      <Modal.Backdrop variant="blur" isDismissable>
        <Modal.Container size="lg" className="max-h-[85dvh]">
          <Modal.Dialog
            aria-label="Log a workout"
            className="flex max-h-[85dvh] flex-col overflow-hidden"
          >
            {({ close }) => (
              <>
                <Modal.Header className="shrink-0 border-b border-border px-6 py-5">
                  <div>
                    <Modal.Heading className="text-xl font-semibold">
                      Log a workout
                    </Modal.Heading>
                    <p className="mt-1 text-sm text-muted">
                      Record the session you just completed.
                    </p>
                  </div>

                  <Modal.CloseTrigger />
                </Modal.Header>

                <Modal.Body className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
                  <WorkoutForm
                    onSuccess={(message) => {
                      close();
                      onSaved?.(message);
                    }}
                  />
                </Modal.Body>
              </>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
