
"use client";

import { useMemo, useState } from "react";
import {
  Clock3,
  Dumbbell,
  Gauge,
  Repeat2,
} from "lucide-react";

import {
  EXERCISES,
  type ExerciseValue,
} from "@/lib/exercises";

import {
  calculateStats,
  formatDate,
  formatDuration,
  formatNumber,
  getChange,
  getStartDate,
  getTotalReps,
  METRICS,
  PERIODS,
  type ExerciseSession,
  type Metric,
  type Period,
} from "./exercise-analytics/analytics-utils";
import ExerciseSelector from "./exercise-analytics/exercise-selector";
import PerformanceChart from "./exercise-analytics/performance-chart";
import type { PerformancePoint } from "./exercise-analytics/performance-chart";
import StatCard from "./exercise-analytics/stat-card";
import TrainingInsights from "./exercise-analytics/training-insights";

export type { ExerciseSession } from "./exercise-analytics/analytics-utils";

export default function ExerciseAnalytics({
  sessions,
  generatedAt,
}: {
  sessions: ExerciseSession[];
  generatedAt: string;
}) {
  const [selectedExercise, setSelectedExercise] =
    useState<ExerciseValue>("PULL_UPS");
  const [period, setPeriod] = useState<Period>("30d");
  const [metric, setMetric] = useState<Metric>("all");

  const now = useMemo(
    () => new Date(generatedAt),
    [generatedAt],
  );

  const exerciseSessions = useMemo(
    () =>
      sessions
        .filter((session) => session.exercise === selectedExercise)
        .sort(
          (a, b) =>
            a.workoutDate.localeCompare(b.workoutDate) ||
            a.createdAt.localeCompare(b.createdAt),
        ),
    [sessions, selectedExercise],
  );

  const periodInfo =
    PERIODS.find((item) => item.value === period) ?? PERIODS[0]!;

  const { currentSessions, previousSessions } = useMemo(() => {
    if (periodInfo.days === null) {
      return {
        currentSessions: exerciseSessions,
        previousSessions: [] as ExerciseSession[],
      };
    }

    const start = getStartDate(now, periodInfo.days);
    const previousEnd = new Date(start);
    previousEnd.setUTCMilliseconds(-1);

    const previousStart = getStartDate(
      previousEnd,
      periodInfo.days,
    );

    return {
      currentSessions: exerciseSessions.filter((session) => {
        const date = new Date(
          `${session.workoutDate}T00:00:00.000Z`,
        );

        return date >= start && date <= now;
      }),
      previousSessions: exerciseSessions.filter((session) => {
        const date = new Date(
          `${session.workoutDate}T00:00:00.000Z`,
        );

        return date >= previousStart && date <= previousEnd;
      }),
    };
  }, [exerciseSessions, now, periodInfo.days]);

  const currentStats = useMemo(
    () => calculateStats(currentSessions),
    [currentSessions],
  );

  const previousStats = useMemo(
    () => calculateStats(previousSessions),
    [previousSessions],
  );

  const chartData = useMemo<PerformancePoint[]>(
    () => {
      return currentSessions.map((session) => ({
        id: session.id,
        date: session.workoutDate,
        dateLabel: formatDate(session.workoutDate),
        value:
          metric === "all"
            ? 0
            : metric === "rate"
              ? session.repsPerMinute
              : metric === "reps"
                ? getTotalReps(session)
                : session.durationMinutes,
        durationMinutes: session.durationMinutes,
        repsPerMinute: session.repsPerMinute,
        totalReps: getTotalReps(session),
      }));
    },
    [currentSessions, metric],
  );

  const bestRate = useMemo(
    () =>
      exerciseSessions.reduce<ExerciseSession | null>(
        (best, session) =>
          !best || session.repsPerMinute > best.repsPerMinute
            ? session
            : best,
        null,
      ),
    [exerciseSessions],
  );

  const bestVolume = useMemo(
    () =>
      exerciseSessions.reduce<ExerciseSession | null>(
        (best, session) =>
          !best || getTotalReps(session) > getTotalReps(best)
            ? session
            : best,
        null,
      ),
    [exerciseSessions],
  );

  const latestSession =
    exerciseSessions[exerciseSessions.length - 1] ?? null;

  const activeDays = useMemo(
    () =>
      new Set(
        currentSessions.map((session) => session.workoutDate),
      ).size,
    [currentSessions],
  );

  const hasPreviousPeriod =
    period !== "all" && previousSessions.length > 0;

  const rateChange =
    previousSessions.length > 0
      ? getChange(
          currentStats.averageRate,
          previousStats.averageRate,
        )
      : null;

  const metricLabel =
    METRICS.find((item) => item.value === metric)?.label ??
    "All";

  const exerciseLabel =
    EXERCISES.find((item) => item.value === selectedExercise)?.label ??
    selectedExercise;

  const insight =
    currentSessions.length === 0
      ? "No sessions in this period. Try a longer date range to see your recent training patterns."
      : currentSessions.length === 1
        ? "One session gives you a starting point. Log more workouts to reveal meaningful trends."
        : hasPreviousPeriod && rateChange !== null
          ? rateChange > 0
            ? `Your average pace is up ${rateChange.toFixed(1)}% compared with the previous period. Compare session duration too, so you can distinguish a faster pace from simply doing more work.`
            : rateChange < 0
              ? `Your average pace is down ${Math.abs(rateChange).toFixed(1)}% compared with the previous period. This can reflect fatigue, a deliberate easier session, or a change in training conditions.`
              : "Your average pace is unchanged from the previous period."
          : "Your workout history is building a baseline. Use the chart to compare your session pace, volume, and duration over time.";

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.18em] text-brand">
          TRAINING ANALYTICS
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Exercise Insights
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Understand your pace, training volume, and consistency
              across each movement.
            </p>
          </div>

          <label className="flex shrink-0 items-center gap-3 text-xs text-muted">
            <span>Time range</span>

            <select
              value={period}
              onChange={(event) =>
                setPeriod(event.target.value as Period)
              }
              className="h-10 rounded-xl border border-border bg-surface px-3 text-sm font-medium text-foreground outline-none focus:border-foreground"
            >
              {PERIODS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <ExerciseSelector
        sessions={sessions}
        selectedExercise={selectedExercise}
        onSelect={setSelectedExercise}
        selectedSessionCount={exerciseSessions.length}
      />

      <section className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium text-muted">
              CURRENT EXERCISE
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              {exerciseLabel}
            </h2>
          </div>

          {latestSession && (
            <p className="text-xs text-muted">
              Latest session: {formatDate(latestSession.workoutDate)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-4 xl:grid-cols-4">
          <StatCard
            label="Sessions"
            value={formatNumber(currentStats.sessions)}
            detail={`Within ${periodInfo.label.toLowerCase()}`}
            icon={Dumbbell}
            comparison={
              hasPreviousPeriod
                ? {
                    current: currentStats.sessions,
                    previous: previousStats.sessions,
                  }
                : null
            }
          />

          <StatCard
            label="Training time"
            value={formatDuration(currentStats.totalMinutes)}
            detail="Total time logged"
            icon={Clock3}
            comparison={
              hasPreviousPeriod
                ? {
                    current: currentStats.totalMinutes,
                    previous: previousStats.totalMinutes,
                  }
                : null
            }
          />

          <StatCard
            label="Total repetitions"
            value={formatNumber(currentStats.totalReps)}
            detail="Duration × reps per minute"
            icon={Repeat2}
            comparison={
              hasPreviousPeriod
                ? {
                    current: currentStats.totalReps,
                    previous: previousStats.totalReps,
                  }
                : null
            }
          />

          <StatCard
            label="Average pace"
            value={formatNumber(currentStats.averageRate, 1)}
            detail="Reps per minute per session"
            icon={Gauge}
            comparison={
              hasPreviousPeriod
                ? {
                    current: currentStats.averageRate,
                    previous: previousStats.averageRate,
                  }
                : null
            }
          />
        </div>
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
        <PerformanceChart
          data={chartData}
          metric={metric}
          onMetricChange={setMetric}
          metricLabel={metricLabel}
          periodLabel={periodInfo.label}
          exerciseLabel={exerciseLabel}
        />

        <TrainingInsights
          insight={insight}
          activeDays={activeDays}
          currentSessionCount={currentStats.sessions}
          bestRate={bestRate}
          bestVolume={bestVolume}
        />
      </section>
    </div>
  );
}
