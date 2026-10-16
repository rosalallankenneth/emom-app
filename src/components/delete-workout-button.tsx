
"use client";

import { Button } from "@heroui/react";
import { Trash2 } from "lucide-react";

import { deleteWorkout } from "@/actions/workouts";

export default function DeleteWorkoutButton({ id }: { id: string }) {
  return (
    <form
      action={deleteWorkout}
      onSubmit={(event) => {
        if (!window.confirm("Delete this workout? This cannot be undone.")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />

      <Button
        type="submit"
        isIconOnly
        variant="danger-soft"
        size="sm"
        aria-label="Delete workout"
        className="size-9 min-w-9 rounded-xl"
      >
        <Trash2 size={16} aria-hidden="true" />
      </Button>
    </form>
  );
}
