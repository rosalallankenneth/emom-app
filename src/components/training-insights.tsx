
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  Clock3,
  Dumbbell,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EXERCISES } from "@/lib/exercises";
import {
  formatDate,
  formatDuration,
  formatNumber,
  getTotalReps,
  type ExerciseSession,
} from "@/components/exercise-analytics/analytics-utils";

import TrainingActivityCalendar from "@/components/training-activity-calendar";

type Period = "30d" | "90d" | "6m" | "all";
type WorkloadMetric = "sessions" | "minutes" | "reps";

const PERIODS: { value: Period; label: string; days: number | null }[] = [
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "90d", label: "Last 90 days", days: 90 },
  { value: "6m", label: "Last 6 months", days: 183 },
  { value: "all", label: "All time", days: null },
];

const METRICS: { value: WorkloadMetric; label: string }[] = [
  { value: "sessions", label: "Sessions" },
  { value: "minutes", label: "Training time" },
  { value: "reps", label: "Total reps" },
];

function dateFromISO(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function shiftDays(value: string, days: number) {
  const date = dateFromISO(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string) {
  return Math.max(
    0,
    Math.floor(
      (dateFromISO(to).getTime() - dateFromISO(from).getTime()) /
        86_400_000,
    ),
  );
}

function getPeriodStart(today: string, days: number) {
  return shiftDays(today, -(days - 1));
}

function getBucketStart(value: string, monthly: boolean) {
  const date = dateFromISO(value);

  if (monthly) {
    date.setUTCDate(1);
  } else {
    const mondayOffset = (date.getUTCDay() + 6) % 7;
    date.setUTCDate(date.getUTCDate() - mondayOffset);
  }

  return date.toISOString().slice(0, 10);
}

function formatBucketLabel(value: string, monthly: boolean) {
  const date = dateFromISO(value);

  if (monthly) {
    return new Intl.DateTimeFormat("en-PH", {
      month: "short",
      year: "2-digit",
      timeZone: "UTC",
    }).format(date);
  }

  const weekEnd = new Date(date);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

  const formatDay = (value: Date) =>
    new Intl.DateTimeFormat("en-PH", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(value);

  return `${formatDay(date)} to ${formatDay(weekEnd)}`;
}

function getChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

function ChangeText({
  current,
  previous,
}: {
  current: number;
  previous: number | null;
}) {
  if (previous === null) {
    return (
      <p className="mt-2 text-xs text-muted">
        Comparison unavailable
      </p>
    );
  }

  const change = getChange(current, previous);

  if (change === null) {
    return (
      <p className="mt-2 text-xs text-muted">
        No activity in the previous period
      </p>
    );
  }

  return (
    <p className="mt-2 text-xs text-muted">
      <span
        className={
          change > 0
            ? "font-semibold text-brand"
            : change < 0
              ? "font-semibold text-foreground"
              : "font-semibold"
        }
      >
        {change > 0 ? "+" : ""}
        {change.toLocaleString("en-PH", {
          maximumFractionDigits: 1,
        })}
        %
      </span>{" "}
      vs. previous period
    </p>
  );
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: typeof Activity;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted">{label}</p>
        <Icon size={18} className="text-muted" aria-hidden="true" />
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
        {value}
      </p>
      <p className="mt-2 text-xs text-muted">{description}</p>
    </section>
  );
}

export default function TrainingInsights({
  sessions,
  generatedAt,
}: {
  sessions: ExerciseSession[];
  generatedAt: string;
}) {
  const [period, setPeriod] = useState<Period>("30d");
  const [workloadMetric, setWorkloadMetric] =
    useState<WorkloadMetric>("sessions");

  const today = generatedAt.slice(0, 10);
  const selectedPeriod = PERIODS.find((item) => item.value === period)!;
  const days = selectedPeriod.days;

  const startDate = days === null ? null : getPeriodStart(today, days);
  const previousStart =
    days === null || startDate === null
      ? null
      : shiftDays(startDate, -days);

  const currentSessions = sessions.filter((session) => {
    return (
      session.workoutDate <= today &&
      (startDate === null || session.workoutDate >= startDate)
    );
  });

  const previousSessions =
    previousStart === null || startDate === null
      ? null
      : sessions.filter(
          (session) =>
            session.workoutDate >= previousStart &&
            session.workoutDate < startDate,
        );

  const summary = useMemo(() => {
    const totalMinutes = currentSessions.reduce(
      (sum, session) => sum + session.durationMinutes,
      0,
    );

    const totalReps = currentSessions.reduce(
      (sum, session) => sum + getTotalReps(session),
      0,
    );

    const previousMinutes =
      previousSessions?.reduce(
        (sum, session) => sum + session.durationMinutes,
        0,
      ) ?? null;

    const previousReps =
      previousSessions?.reduce(
        (sum, session) => sum + getTotalReps(session),
        0,
      ) ?? null;

    let trackedDays = days ?? 0;

    if (days === null && sessions.length > 0) {
      trackedDays = Math.max(
        1,
        daysBetween(sessions[0].workoutDate, today) + 1,
      );
    }

    const weeks = Math.max(trackedDays / 7, 1 / 7);

    const minutesPerWeek = totalMinutes / weeks;

    const previousWeeks =
      days === null ? null : Math.max(days / 7, 1 / 7);

    return {
      totalMinutes,
      totalReps,
      sessions: currentSessions.length,
      previousSessions: previousSessions?.length ?? null,
      previousMinutes,
      previousReps,
      sessionsPerWeek: currentSessions.length / weeks,
      minutesPerWeek,
      previousSessionsPerWeek:
        previousSessions === null || previousWeeks === null
          ? null
          : previousSessions.length / previousWeeks,
    };
  }, [currentSessions, previousSessions, days, sessions, today]);

  const distribution = EXERCISES.map((exercise) => {
    const exerciseSessions = currentSessions.filter(
      (session) => session.exercise === exercise.value,
    );

    const allExerciseSessions = sessions.filter(
      (session) => session.exercise === exercise.value,
    );

    const lastSession = allExerciseSessions.at(-1) ?? null;

    return {
      ...exercise,
      count: exerciseSessions.length,
      percentage:
        currentSessions.length > 0
          ? (exerciseSessions.length / currentSessions.length) * 100
          : 0,
      lastDate: lastSession?.workoutDate ?? null,
      daysSince:
        lastSession === null
          ? null
          : daysBetween(lastSession.workoutDate, today),
    };
  });

  const recency = [...distribution].sort((a, b) => {
    if (a.daysSince === null && b.daysSince === null) return 0;
    if (a.daysSince === null) return -1;
    if (b.daysSince === null) return 1;
    return b.daysSince - a.daysSince;
  });

  const workloadData = useMemo(() => {
    if (currentSessions.length === 0) return [];

    const monthly = period === "6m" || period === "all";
    const firstDate =
      startDate ??
      currentSessions[0].workoutDate;

    const firstBucket = getBucketStart(firstDate, monthly);
    const lastBucket = getBucketStart(today, monthly);
    const totals = new Map<
      string,
      { sessions: number; minutes: number; reps: number }
    >();

    for (const session of currentSessions) {
      const key = getBucketStart(session.workoutDate, monthly);
      const total = totals.get(key) ?? {
        sessions: 0,
        minutes: 0,
        reps: 0,
      };

      total.sessions += 1;
      total.minutes += session.durationMinutes;
      total.reps += getTotalReps(session);
      totals.set(key, total);
    }

    const data: {
      label: string;
      sessions: number;
      minutes: number;
      reps: number;
    }[] = [];

    const cursor = dateFromISO(firstBucket);
    const end = dateFromISO(lastBucket);

    while (cursor <= end) {
      const key = cursor.toISOString().slice(0, 10);
      const total = totals.get(key) ?? {
        sessions: 0,
        minutes: 0,
        reps: 0,
      };

      data.push({
        label: formatBucketLabel(key, monthly),
        ...total,
      });

      if (monthly) {
        cursor.setUTCMonth(cursor.getUTCMonth() + 1);
      } else {
        cursor.setUTCDate(cursor.getUTCDate() + 7);
      }
    }

    return data;
  }, [currentSessions, period, startDate, today]);

  const periodDescription =
    period === "all"
      ? "Across your entire logged training history"
      : `From ${formatDate(startDate!)} to ${formatDate(today)}`;

  const metricLabel =
    METRICS.find((metric) => metric.value === workloadMetric)?.label ??
    "Sessions";

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
            Training analytics
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Training Insights
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Understand your training balance, consistency, and workload
            across all eight exercises.
          </p>
        </div>

        <label className="flex flex-col gap-2 text-xs font-semibold text-muted">
          Analysis period
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value as Period)}
            className="min-w-44 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none focus:border-brand"
          >
            {PERIODS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-xs text-muted">{periodDescription}</p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Training sessions"
          value={formatNumber(summary.sessions)}
          description="Completed sessions in this period"
          icon={Dumbbell}
        />
        <StatCard
          label="Training time"
          value={formatDuration(summary.totalMinutes)}
          description="Total logged workout minutes"
          icon={Clock3}
        />
        <StatCard
          label="Minutes per week"
          value={formatNumber(summary.minutesPerWeek)}
          description="Average weekly training time"
          icon={Clock3}
        />
        <StatCard
          label="Sessions per week"
          value={summary.sessionsPerWeek.toLocaleString("en-PH", {
            maximumFractionDigits: 1,
          })}
          description={
            period === "all"
              ? "Average since your first logged session"
              : "Average within the selected period"
          }
          icon={CalendarDays}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="min-w-0 rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-bold">Training Distribution</h2>
            <p className="mt-1 text-sm text-muted">
              How your sessions are divided across all eight exercises.
            </p>
          </div>

          <div className="mt-6 space-y-5">
            {distribution.map((exercise) => (
              <div key={exercise.value}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">
                    {exercise.label}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-muted">
                    {exercise.count}{" "}
                    {exercise.count === 1 ? "session" : "sessions"}
                    {" · "}
                    {exercise.percentage.toFixed(0)}%
                  </span>
                </div>

                <div
                  className="h-2 overflow-hidden rounded-full bg-background"
                  role="progressbar"
                  aria-label={`${exercise.label} share of sessions`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(exercise.percentage)}
                >
                  <div
                    className="h-full rounded-full bg-brand transition-[width]"
                    style={{ width: `${exercise.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {currentSessions.length === 0 && (
            <p className="mt-5 rounded-xl bg-background p-4 text-sm text-muted">
              No sessions were logged during this period.
            </p>
          )}
        </section>

        <section className="min-w-0 rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <h2 className="text-lg font-bold">Overall Workload</h2>
              <p className="mt-1 text-sm text-muted">
                Track how your logged training changes over time.
              </p>
            </div>

            <select
              aria-label="Workload chart metric"
              value={workloadMetric}
              onChange={(event) =>
                setWorkloadMetric(event.target.value as WorkloadMetric)
              }
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
            >
              {METRICS.map((metric) => (
                <option key={metric.value} value={metric.value}>
                  {metric.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 h-72 w-full">
            {workloadData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={workloadData}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="var(--border)"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "var(--muted)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={16}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "var(--muted)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--background)" }}
                    contentStyle={{
                      backgroundColor: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      color: "var(--foreground)",
                      fontSize: 12,
                    }}
                    formatter={(value) => [
                      formatNumber(Number(value)),
                      metricLabel,
                    ]}
                  />
                  <Bar
                    dataKey={workloadMetric}
                    name={metricLabel}
                    fill="var(--accent)"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl bg-background p-6 text-center text-sm text-muted">
                Log a workout to start building your workload history.
              </div>
            )}
          </div>

          <p className="mt-3 text-xs text-muted">
            {period === "6m" || period === "all"
              ? "Grouped by month."
              : "Grouped by week, starting Monday."}
          </p>
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-bold">Exercise Recency</h2>
          <p className="mt-1 text-sm text-muted">
            When you last trained each movement, based on all logged history.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {recency.map((exercise) => {
            const neverTrained = exercise.lastDate === null;
            const longGap =
              exercise.daysSince !== null && exercise.daysSince >= 14;

            return (
              <div
                key={exercise.value}
                className="rounded-xl border border-border bg-background p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold">{exercise.label}</p>
                  {neverTrained ? (
                    <span className="rounded-md bg-surface px-2 py-1 text-[10px] font-bold text-muted">
                      NEW
                    </span>
                  ) : longGap ? (
                    <span className="rounded-md bg-surface px-2 py-1 text-[10px] font-bold text-muted">
                      14+ DAYS
                    </span>
                  ) : null}
                </div>

                <p className="mt-4 text-lg font-bold">
                  {neverTrained
                    ? "Not yet logged"
                    : exercise.daysSince === 0
                      ? "Today"
                      : `${formatNumber(exercise.daysSince!)} ${
                          exercise.daysSince === 1 ? "day" : "days"
                        } ago`}
                </p>

                <p className="mt-1 text-xs text-muted">
                  {neverTrained
                    ? "No recorded sessions"
                    : `Last session: ${formatDate(exercise.lastDate!)}`}
                </p>

                <p className="mt-3 text-xs text-muted">
                  {formatNumber(exercise.count)}{" "}
                  {exercise.count === 1 ? "session" : "sessions"} in this
                  period
                </p>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-xs leading-5 text-muted">
          Recency reflects your recorded sessions, not a recovery
          assessment or a recommendation to train a particular movement.
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-background">
            <Activity size={19} className="text-brand" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Consistency Check</h2>
            <p className="text-sm text-muted">
              Compare your training frequency with the previous period.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-background p-4">
            <p className="text-sm text-muted">Current sessions</p>
            <p className="mt-2 text-2xl font-bold">
              {formatNumber(summary.sessions)}
            </p>
            {previousSessions !== null && (
              <ChangeText
                current={summary.sessions}
                previous={summary.previousSessions}
              />
            )}
          </div>

          <div className="rounded-xl bg-background p-4">
            <p className="text-sm text-muted">Current training time</p>
            <p className="mt-2 text-2xl font-bold">
              {formatDuration(summary.totalMinutes)}
            </p>
            {previousSessions !== null && (
              <ChangeText
                current={summary.totalMinutes}
                previous={summary.previousMinutes}
              />
            )}
          </div>

          <div className="rounded-xl bg-background p-4">
            <p className="text-sm text-muted">Current total reps</p>
            <p className="mt-2 text-2xl font-bold">
              {formatNumber(summary.totalReps)}
            </p>
            {previousSessions !== null && (
              <ChangeText
                current={summary.totalReps}
                previous={summary.previousReps}
              />
            )}
          </div>
        </div>

        {previousSessions !== null && (
          <p className="mt-4 text-xs leading-5 text-muted">
            Comparisons use the immediately preceding period of equal
            length. Percentage changes are descriptive, not a measure
            of whether a workload is better or worse.
          </p>
        )}

        {period === "all" && (
          <p className="mt-4 text-xs leading-5 text-muted">
            Select a fixed period to compare your results with the
            preceding period.
          </p>
        )}
      </section>

      <TrainingActivityCalendar sessions={sessions} />
    </div>
  );
}
