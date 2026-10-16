-- CreateEnum
CREATE TYPE "Exercise" AS ENUM ('PULL_UPS', 'PUSH_UPS', 'ROWS', 'DIPS', 'PIKE_PUSH_UPS', 'SQUATS', 'SPLIT_SQUATS', 'RDLS');

-- CreateTable
CREATE TABLE "WorkoutSession" (
    "id" TEXT NOT NULL,
    "exercise" "Exercise" NOT NULL,
    "workoutDate" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 20,
    "repsPerMinute" INTEGER[],
    "externalLoadKg" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkoutSession_workoutDate_idx" ON "WorkoutSession"("workoutDate");

-- CreateIndex
CREATE INDEX "WorkoutSession_exercise_workoutDate_idx" ON "WorkoutSession"("exercise", "workoutDate");
