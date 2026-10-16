"use client";

import { Button, Modal, useOverlayState } from "@heroui/react";

import WorkoutForm from "@/app/workouts/new/workout-form";

export default function NewWorkoutModal() {
  const modalState = useOverlayState({ defaultOpen: false });

  return (
    <Modal state={modalState}>
      <Button
        onPress={modalState.open}
        variant="primary"
        className="h-11 rounded-xl px-5 font-semibold"
      >
        <span aria-hidden="true" className="text-lg leading-none">
          +
        </span>
        New workout
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