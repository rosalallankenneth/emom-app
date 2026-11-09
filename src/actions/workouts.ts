
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { EXERCISE_VALUES } from "@/lib/exercises";
import { requireAuth } from "@/lib/require-auth";

export type WorkoutFormState = {
  success: boolean;
  message: string;
};

export type UpdateWorkoutState = {
  success: boolean;
  message: string;
};

const workoutSchema = z
  .object({
    exercise: z.enum(EXERCISE_VALUES),
    customExerciseName: z.string().trim().max(100).optional(),

    workoutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "Enter a valid workout date.",
    }),

    durationMinutes: z.coerce.number().int().min(10).max(30),

    repsPerMinute: z.preprocess(
      (value) => value === "" || value === null ? undefined : value,
      z.coerce.number().int().min(0).max(1000).optional(),
    ),

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
    if (data.exercise === "OTHER" && !data.customExerciseName?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["customExerciseName"],
        message: "Enter the name of the exercise.",
      });
    }
    if (data.exercise !== "OTHER" && data.repsPerMinute === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["repsPerMinute"],
        message: "Enter reps per minute for this exercise.",
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
  const session = await requireAuth("/");

  const rawData = {
    exercise: formData.get("exercise"),
    customExerciseName: formData.get("customExerciseName") ?? "",
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
        customExerciseName:
          data.exercise === "OTHER" ? data.customExerciseName?.trim() : null,
        workoutDate: new Date(
          `${data.workoutDate}T00:00:00.000Z`,
        ),
        durationMinutes: data.durationMinutes,
        repsPerMinute: data.repsPerMinute,
        externalLoadKg: data.externalLoadKg ?? null,
        notes: data.notes.trim() || null,
        userId: session.user.id,
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

const updateWorkoutSchema = z.object({
  id: z.string().min(1),
  exercise: z.enum(EXERCISE_VALUES),
  customExerciseName: z.string().trim().max(100).optional(),
  workoutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  durationMinutes: z.coerce.number().int().min(10).max(30),
  repsPerMinute: z.preprocess(
    (value) => value === "" || value === null ? undefined : value,
    z.coerce.number().int().min(0).max(1000).optional(),
  ),
  externalLoadKg: z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }

      if (typeof value === "string" || typeof value === "number") {
        return Number(value);
      }

      return value;
    },
    z.number().positive().max(1000).optional(),
  ),
  notes: z.string().max(1000),
}).superRefine((data, ctx) => {
  if (data.exercise === "OTHER" && !data.customExerciseName?.trim()) {
    ctx.addIssue({ code: "custom", path: ["customExerciseName"], message: "Enter the name of the exercise." });
  }
  if (data.exercise !== "OTHER" && data.repsPerMinute === undefined) {
    ctx.addIssue({ code: "custom", path: ["repsPerMinute"], message: "Enter reps per minute for this exercise." });
  }
});

export async function updateWorkout(
  _previousState: UpdateWorkoutState,
  formData: FormData,
): Promise<UpdateWorkoutState> {
  const session = await requireAuth("/workouts");

  const parsed = updateWorkoutSchema.safeParse({
    id: formData.get("id"),
    exercise: formData.get("exercise"),
    customExerciseName: formData.get("customExerciseName") ?? "",
    workoutDate: formData.get("workoutDate"),
    durationMinutes: formData.get("durationMinutes"),
    repsPerMinute: formData.get("repsPerMinute"),
    externalLoadKg: formData.get("externalLoadKg"),
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid workout data.",
    };
  }

  const data = parsed.data;
  const date = new Date(`${data.workoutDate}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== data.workoutDate
  ) {
    return {
      success: false,
      message: "Enter a real calendar date.",
    };
  }

  try {
    const result = await prisma.workoutSession.updateMany({
      where: { id: data.id, userId: session.user.id },
      data: {
        exercise: data.exercise,
        customExerciseName:
          data.exercise === "OTHER" ? data.customExerciseName?.trim() : null,
        workoutDate: date,
        durationMinutes: data.durationMinutes,
        repsPerMinute: data.repsPerMinute,
        externalLoadKg: data.externalLoadKg ?? null,
        notes: data.notes.trim() || null,
      },
    });

    if (result.count === 0) {
      return {
        success: false,
        message: "Unable to update this workout. Please try again.",
      };
    }

    revalidatePath("/");
    revalidatePath("/workouts");

    return {
      success: true,
      message: "Workout updated successfully.",
    };
  } catch (error) {
    console.error("Failed to update workout:", error);

    return {
      success: false,
      message: "Unable to update this workout. Please try again.",
    };
  }
}

export async function deleteWorkout(formData: FormData) {
  const session = await requireAuth("/workouts");

  const id = formData.get("id");

  if (typeof id !== "string" || !id.trim()) {
    throw new Error("Invalid workout ID.");
  }

  const result = await prisma.workoutSession.deleteMany({
    where: { id, userId: session.user.id },
  });

  if (result.count === 0) {
    throw new Error("Workout not found.");
  }

  revalidatePath("/");
  revalidatePath("/workouts");
}
