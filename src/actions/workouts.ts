
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { EXERCISE_VALUES } from "@/lib/exercises";

export type WorkoutFormState = {
  success: boolean;
  message: string;
};

const workoutSchema = z
  .object({
    exercise: z.enum(EXERCISE_VALUES),

    workoutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "Enter a valid workout date.",
    }),

    durationMinutes: z.coerce.number().int().min(10).max(30),

    repsPerMinute: z.coerce.number().int().min(0).max(1000),

    externalLoadKg: z.preprocess(
      (value) =>
        value === "" || value === null || value === undefined
          ? undefined
          : Number(value),
      z.number().positive().max(1000).optional(),
    ),

    notes: z.string().max(1000, {
      message: "Notes must not exceed 1,000 characters.",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.exercise !== "RDLS" && data.externalLoadKg !== undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["externalLoadKg"],
        message: "External load is only supported for RDLs.",
      });
    }

    const date = new Date(`${data.workoutDate}T00:00:00.000Z`);

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== data.workoutDate
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["workoutDate"],
        message: "Enter a real calendar date.",
      });
    }
  });

export async function createWorkout(
  _previousState: WorkoutFormState,
  formData: FormData,
): Promise<WorkoutFormState> {
  const rawData = {
    exercise: formData.get("exercise"),
    workoutDate: formData.get("workoutDate"),
    durationMinutes: formData.get("durationMinutes"),
    repsPerMinute: formData.get("repsPerMinute"),
    externalLoadKg: formData.get("externalLoadKg"),
    notes: formData.get("notes"),
  };

  const parsed = workoutSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid workout data.",
    };
  }

  const data = parsed.data;

  try {
    await prisma.workoutSession.create({
      data: {
        exercise: data.exercise,
        workoutDate: new Date(
          `${data.workoutDate}T00:00:00.000Z`,
        ),
        durationMinutes: data.durationMinutes,
        repsPerMinute: data.repsPerMinute,
        externalLoadKg:
          data.exercise === "RDLS"
            ? data.externalLoadKg ?? null
            : null,
        notes: data.notes.trim() || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/workouts");

    return {
      success: true,
      message: "Workout saved successfully.",
    };
  } catch (error) {
    console.error("Failed to create workout:", error);

    return {
      success: false,
      message: "Unable to save the workout. Check the database connection and try again.",
    };
  }
}
