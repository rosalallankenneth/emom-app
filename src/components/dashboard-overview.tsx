
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  Clock3,
  Dumbbell,
  Repeat2,
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

import {
  DASHBOARD_PERIODS,
  type DashboardPeriod,
} from "@/lib/dashboard-periods";

type ExerciseStat = {
  value: string;
  label: string;
  sessions: number;
  hours: number;
  reps: number;
};

type Recommendation = {
  value: string;
  label: string;
  lastPerformed: Date | null;
};

type DashboardOverviewProps = {
  period: DashboardPeriod;
  sessionCount: number;
  totalMinutes: number;
  totalReps: number;
  exerciseStats: ExerciseStat[];
  recommendations: Recommendation[];
};

type ChartMetric = "sessions" | "hours" | "reps";

const METRICS: { value: ChartMetric; label: string }[] = [
  { value: "sessions", label: "Sessions" },
  { value: "hours", label: "Hours" },
  { value: "reps", label: "Reps" },
];

function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr`;

  return `${hours} hr ${minutes} min`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatLastPerformed(date: Date | null) {
  if (!date) return "Never logged";
  return `Last trained ${formatDate(date)}`;
}

export default function DashboardOverview({
  period,
  sessionCount,
  totalMinutes,
  totalReps,
  exerciseStats,
  recommendations,
}: DashboardOverviewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [metric, setMetric] = useState<ChartMetric>("sessions");

  const stats = [
    {
      label: "Sessions logged",
      value: sessionCount.toLocaleString("en-PH"),
      detail: "Completed workouts in this period",
      icon: Dumbbell,
    },
    {
      label: "Training time",
      value: formatDuration(totalMinutes),
      detail: "Time invested in training",
      icon: Clock3,
    },
    {
      label: "Total repetitions",
      value: totalReps.toLocaleString("en-PH"),
      detail: "Duration × reps per minute",
      icon: Repeat2,
    },
  ];

  function changePeriod(nextPeriod: DashboardPeriod) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextPeriod === "month") {
      params.delete("period");
    } else {
      params.set("period", nextPeriod);
    }

    const query = params.toString();
    router.replace(query ? `/?${query}` : "/", { scroll: false });
  }

  const metricLabel =
    METRICS.find((item) => item.value === metric)?.label ?? "Sessions";

  const chartData = exerciseStats.map((exercise) => ({
    exercise: exercise.label,
    value: exercise[metric],
  }));

  return (
    <div className="space-y-8">
      {/* Summary statistics */}
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold">Training overview</h2>

          <label className="flex items-center gap-3 text-xs text-muted">
            <span>Period</span>
            <select
              value={period}
              onChange={(event) =>
                changePeriod(event.target.value as DashboardPeriod)
              }
              className="h-10 rounded-xl border border-border bg-surface px-3 text-sm font-medium text-foreground outline-none focus:border-foreground"
            >
              {DASHBOARD_PERIODS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-2xl border border-border bg-surface p-5 sm:p-6"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted">{stat.label}</p>

                <span className="flex size-9 items-center justify-center rounded-xl bg-background text-muted">
                  <stat.icon
                    size={18}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </span>
              </div>

              <p className="mt-5 text-3xl font-semibold tracking-tight tabular-nums">
                {stat.value}
              </p>

              <p className="mt-2 text-xs text-muted">{stat.detail}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Exercise chart and recommendations */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold tracking-tight">
            Exercise breakdown
          </h2>
          <p className="mt-1 text-sm text-muted">
            Compare your training across all eight exercises.
          </p>
        </div>

        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(260px,1fr)]">
          <article className="min-w-0 rounded-2xl border border-border bg-surface p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-semibold">Training by exercise</h3>
                <p className="mt-1 text-xs text-muted">
                  {metricLabel} ·{" "}
                  {DASHBOARD_PERIODS.find(
                    (option) => option.value === period,
                  )?.label}
                </p>
              </div>

              <div
                className="flex w-fit rounded-xl border border-border bg-background p-1"
                aria-label="Chart metric"
              >
                {METRICS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setMetric(item.value)}
                    aria-pressed={metric === item.value}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                      metric === item.value
                        ? "bg-foreground text-background"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 h-[300px] w-full sm:h-[340px]">
              {sessionCount === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <Activity
                    size={28}
                    className="text-muted"
                    aria-hidden="true"
                  />
                  <p className="mt-3 text-sm font-medium">
                    No workouts in this period
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Your exercise breakdown will appear here once you log a session.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 12, right: 8, left: -16, bottom: 42 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="var(--border)"
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="exercise"
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={68}
                      tick={{ fill: "var(--muted)", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={metric === "hours"}
                      width={42}
                      tick={{ fill: "var(--muted)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value: number) =>
                        Number(value).toLocaleString("en-PH")
                      }
                    />
                    <Tooltip
                      cursor={{ fill: "var(--background)" }}
                      contentStyle={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        color: "var(--foreground)",
                        fontSize: 12,
                      }}
                      formatter={(value) => [
                        Number(value).toLocaleString("en-PH"),
                        metricLabel,
                      ]}
                    />
                    <Bar
                      dataKey="value"
                      name={metricLabel}
                      fill="#c8f169"
                      radius={[5, 5, 0, 0]}
                      maxBarSize={36}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <div className="mb-4">
              <h3 className="font-semibold">What to train next</h3>
              <p className="mt-1 text-xs leading-5 text-muted">
                Your three least-recently-trained exercises, based on all your workouts.
              </p>
            </div>

            <div className="space-y-3">
              {recommendations.map((exercise, index) => (
                <div
                  key={exercise.value}
                  className={`rounded-xl border p-4 ${
                    index === 0
                      ? "border-foreground bg-foreground text-white"
                      : "border-border bg-background"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${
                        index === 0
                          ? "bg-brand text-brand-foreground"
                          : "bg-surface text-foreground"
                      }`}
                    >
                      0{index + 1}
                    </span>

                    <div className="min-w-0">
                      <h4 className="font-semibold">{exercise.label}</h4>
                      <p
                        className={`mt-1 text-xs ${
                          index === 0 ? "text-white/65" : "text-muted"
                        }`}
                      >
                        {formatLastPerformed(exercise.lastPerformed)}
                      </p>
                    </div>
                  </div>

                  {exercise.lastPerformed === null && (
                    <span
                      className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                        index === 0
                          ? "bg-white/10 text-white"
                          : "bg-brand text-brand-foreground"
                      }`}
                    >
                      Not logged
                    </span>
                  )}
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs leading-5 text-muted">
              Recommendations use your complete workout history, regardless of the selected period.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}