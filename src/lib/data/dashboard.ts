
import "server-only";

import { prisma } from "@/lib/prisma";
import { EXERCISES } from "@/lib/exercises";
import type { DashboardPeriod } from "@/lib/dashboard-periods";

export const DASHBOARD_PERIODS = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
  { value: "all", label: "All Time" },
] as const;

function getPeriodWhere(period: DashboardPeriod) {
  if (period === "all") {
    return undefined;
  }

  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  if (period === "week") {
    // Monday is the first day of the week.
    const day = now.getUTCDay();
    const daysSinceMonday = (day + 6) % 7;

    startDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - daysSinceMonday,
      ),
    );

    endDate = new Date(startDate);
    endDate.setUTCDate(endDate.getUTCDate() + 7);
  } else if (period === "month") {
    startDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );

    endDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
    );
  } else {
    startDate = new Date(
      Date.UTC(now.getUTCFullYear(), 0, 1),
    );

    endDate = new Date(
      Date.UTC(now.getUTCFullYear() + 1, 0, 1),
    );
  }

  return {
    workoutDate: {
      gte: startDate,
      lt: endDate,
    },
  };
}

export async function getDashboardData(
  period: DashboardPeriod = "month",
) {
  const periodWhere = getPeriodWhere(period);

  const [
    periodRecords,
    recentSessions,
    exerciseHistory,
  ] = await Promise.all([
    prisma.workoutSession.findMany({
      ...(periodWhere ? { where: periodWhere } : {}),
      select: {
        exercise: true,
        durationMinutes: true,
        repsPerMinute: true,
      },
    }),

    // Recent sessions always reflect the full workout history.
    prisma.workoutSession.findMany({
      orderBy: [
        { workoutDate: "desc" },
        { createdAt: "desc" },
      ],
      take: 5,
    }),

    // Recommendations always reflect the full workout history.
    prisma.workoutSession.groupBy({
      by: ["exercise"],
      _max: { workoutDate: true },
    }),
  ]);

  const sessionCount = periodRecords.length;

  const totalMinutes = periodRecords.reduce(
    (total, session) => total + session.durationMinutes,
    0,
  );

  const totalReps = periodRecords.reduce(
    (total, session) =>
      total + session.durationMinutes * session.repsPerMinute,
    0,
  );

  const statsByExercise = new Map<
    string,
    { sessions: number; minutes: number; reps: number }
  >();

  for (const exercise of EXERCISES) {
    statsByExercise.set(exercise.value, {
      sessions: 0,
      minutes: 0,
      reps: 0,
    });
  }

  for (const session of periodRecords) {
    const stats = statsByExercise.get(session.exercise);

    if (!stats) continue;

    stats.sessions += 1;
    stats.minutes += session.durationMinutes;
    stats.reps +=
      session.durationMinutes * session.repsPerMinute;
  }

  const exerciseStats = EXERCISES.map((exercise) => {
    const stats = statsByExercise.get(exercise.value)!;

    return {
      ...exercise,
      sessions: stats.sessions,
      hours: Number((stats.minutes / 60).toFixed(2)),
      reps: stats.reps,
    };
  });

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
    exerciseStats,
  };
}