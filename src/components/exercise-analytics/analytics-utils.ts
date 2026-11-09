
import type { ExerciseValue } from "@/lib/exercises";

export type ExerciseSession = {
  id: string;
  exercise: ExerciseValue;
  customExerciseName?: string | null;
  workoutDate: string;
  durationMinutes: number;
  repsPerMinute: number;
  externalLoadKg: number | null;
  createdAt: string;
};

export type Period = "30d" | "90d" | "6m" | "all";
export type Metric = "all" | "rate" | "reps" | "duration";

export const PERIODS: {
  value: Period;
  label: string;
  days: number | null;
}[] = [
  { value: "30d", label: "30 days", days: 30 },
  { value: "90d", label: "90 days", days: 90 },
  { value: "6m", label: "6 months", days: 183 },
  { value: "all", label: "All time", days: null },
];

export const METRICS: { value: Metric; label: string }[] = [
  { value: "all", label: "All" },
  { value: "rate", label: "Reps / min" },
  { value: "reps", label: "Total reps" },
  { value: "duration", label: "Duration" },
];

export type ExerciseStats = {
  sessions: number;
  totalMinutes: number;
  totalReps: number;
  averageRate: number;
};

export function getTotalReps(session: ExerciseSession) {
  return session.durationMinutes * (session.repsPerMinute ?? 0);
}

export function formatNumber(
  value: number,
  maximumFractionDigits = 0,
) {
  return value.toLocaleString("en-PH", {
    maximumFractionDigits,
  });
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (hours === 0) return `${remaining} min`;
  if (remaining === 0) return `${hours} hr`;

  return `${hours} hr ${remaining} min`;
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00.000Z`));
}

export function getStartDate(end: Date, days: number) {
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - days + 1);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

export function getChange(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? null : 0;
  }

  return ((current - previous) / previous) * 100;
}

export function calculateStats(
  sessions: ExerciseSession[],
): ExerciseStats {
  const totalMinutes = sessions.reduce(
    (sum, session) => sum + session.durationMinutes,
    0,
  );

  const totalReps = sessions.reduce(
    (sum, session) => sum + getTotalReps(session),
    0,
  );

  const averageRate = sessions.length
    ? sessions.reduce(
        (sum, session) => sum + session.repsPerMinute,
        0,
      ) / sessions.length
    : 0;

  return {
    sessions: sessions.length,
    totalMinutes,
    totalReps,
    averageRate,
  };
}
