
import "server-only";

import { prisma } from "@/lib/prisma";
import { EXERCISES } from "@/lib/exercises";

export async function getDashboardData() {
  const [
    sessionCount,
    durationAggregate,
    recentSessions,
    exerciseHistory,
    repRecords,
  ] = await Promise.all([
    prisma.workoutSession.count(),

    prisma.workoutSession.aggregate({
      _sum: { durationMinutes: true },
    }),

    prisma.workoutSession.findMany({
      orderBy: [
        { workoutDate: "desc" },
        { createdAt: "desc" },
      ],
      take: 5,
    }),

    prisma.workoutSession.groupBy({
      by: ["exercise"],
      _max: { workoutDate: true },
    }),

    prisma.workoutSession.findMany({
      select: {
        durationMinutes: true,
        repsPerMinute: true,
      },
    }),
  ]);

  const totalMinutes =
    durationAggregate._sum.durationMinutes ?? 0;

  const totalReps = repRecords.reduce(
    (total, session) =>
      total + session.durationMinutes * session.repsPerMinute,
    0,
  );

  const latestDateByExercise = new Map(
    exerciseHistory.map((item) => [
      item.exercise,
      item._max.workoutDate,
    ]),
  );

  const recommendations = EXERCISES
    .map((exercise, index) => ({
      ...exercise,
      index,
      lastPerformed:
        latestDateByExercise.get(exercise.value) ?? null,
    }))
    .sort((a, b) => {
      if (!a.lastPerformed && b.lastPerformed) return -1;
      if (a.lastPerformed && !b.lastPerformed) return 1;

      if (!a.lastPerformed && !b.lastPerformed) {
        return a.index - b.index;
      }

      return (
        a.lastPerformed!.getTime() -
          b.lastPerformed!.getTime() ||
        a.index - b.index
      );
    })
    .slice(0, 3);

  return {
    sessionCount,
    totalMinutes,
    totalReps,
    recentSessions,
    recommendations,
  };
}
