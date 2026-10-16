
"use client";

import { Button, Modal, useOverlayState } from "@heroui/react";
import { Dumbbell, Plus } from "lucide-react";

import WorkoutForm from "@/components/workout-form";

type NewWorkoutModalProps = {
  floating?: boolean;
};

export default function NewWorkoutModal({
  floating = false,
}: NewWorkoutModalProps) {
  const modalState = useOverlayState({ defaultOpen: false });

  return (
    <Modal state={modalState}>
      <Button
        onPress={modalState.open}
        variant="primary"
        aria-label={floating ? "New workout" : undefined}
        className={
          floating
            ? "fixed bottom-6 right-6 z-40 flex size-14 min-w-14 items-center justify-center rounded-full p-0 shadow-lg sm:bottom-8 sm:right-8 sm:h-14 sm:w-auto sm:min-w-0 sm:gap-3 sm:rounded-2xl sm:px-7"
            : "h-11 rounded-xl px-5 font-semibold"
        }
      >
        <Dumbbell
          size={24}
          strokeWidth={1.8}
          aria-hidden="true"
        />
        <span className={floating ? "hidden sm:inline" : ""}>
          New workout
        </span>
      </Button>

      <Modal.Backdrop variant="blur" isDismissable>
        <Modal.Container size="lg" scroll="inside">
          <Modal.Dialog aria-label="Log a workout">
            {({ close }) => (
              <>
                <Modal.Header className="border-b border-border px-6 py-5">
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

                <Modal.Body className="px-6 py-5">
                  <WorkoutForm onSuccess={close} />
                </Modal.Body>
              </>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}