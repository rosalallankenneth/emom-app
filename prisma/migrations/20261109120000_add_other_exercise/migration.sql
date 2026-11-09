ALTER TYPE "Exercise" ADD VALUE 'OTHER';

ALTER TABLE "WorkoutSession"
ADD COLUMN "customExerciseName" TEXT,
ALTER COLUMN "repsPerMinute" DROP NOT NULL;
