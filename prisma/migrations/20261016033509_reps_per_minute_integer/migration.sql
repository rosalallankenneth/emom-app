/*
  Warnings:

  - Changed the type of `repsPerMinute` on the `WorkoutSession` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "WorkoutSession" DROP COLUMN "repsPerMinute",
ADD COLUMN     "repsPerMinute" INTEGER NOT NULL;
