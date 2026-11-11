
"use client";

import { ChartNoAxesCombined, ChevronDown } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  formatDate,
  formatNumber,
  METRICS,
  type Metric,
} from "./analytics-utils";

export type PerformancePoint = {
  id: string;
  date: string;
  dateLabel: string;
  value: number;
  durationMinutes: number;
  repsPerMinute: number;
  totalReps: number;
};

const ALL_SERIES = [
  { key: "repsPerMinute", label: "Reps / min", metric: "rate", color: "var(--accent)", gradient: "rateAreaFill" },
  { key: "totalReps", label: "Total reps", metric: "reps", color: "#6fa8e8", gradient: "repsAreaFill" },
  { key: "durationMinutes", label: "Duration", metric: "duration", color: "#b18ad1", gradient: "durationAreaFill" },
] as const;

function formatActualValue(value: number, metric: Metric) {
  if (metric === "duration") return `${formatNumber(value)} min`;
  if (metric === "rate") return `${formatNumber(value, 1)} reps/min`;
  return formatNumber(value);
}

function AllMetricsCharts({ data }: { data: PerformancePoint[] }) {
  return (
    <div className="flex h-full min-h-0 flex-col divide-y divide-border">
      {ALL_SERIES.map((series, index) => (
        <section
          key={series.key}
          aria-label={`${series.label} over time`}
          className="grid min-h-0 flex-1 grid-rows-[16px_minmax(0,1fr)] py-1"
        >
          <h3 className="px-1 text-[10px] font-semibold leading-4 text-muted">
            {series.label}
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id={series.gradient}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={series.color} stopOpacity={0.24} />
                  <stop offset="100%" stopColor={series.color} stopOpacity={0.015} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="dateLabel"
                height={index === ALL_SERIES.length - 1 ? 20 : 0}
                tick={index === ALL_SERIES.length - 1 ? { fill: "var(--muted)", fontSize: 9 } : false}
                axisLine={false}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis
                width={42}
                allowDecimals={series.metric === "rate"}
                tickFormatter={(value: number) =>
                  formatNumber(value, series.metric === "rate" ? 1 : 0)
                }
                tick={{ fill: "var(--muted)", fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.date
                    ? formatDate(payload[0].payload.date)
                    : ""
                }
                formatter={(value) => [
                  formatActualValue(Number(value), series.metric),
                  series.label,
                ]}
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  color: "var(--foreground)",
                  fontSize: 11,
                }}
              />
              <Area
                type="monotone"
                dataKey={series.key}
                name={series.label}
                stroke={series.color}
                fill={`url(#${series.gradient})`}
                strokeWidth={2}
                activeDot={{ r: 4, strokeWidth: 0 }}
                dot={{ r: 2, fill: series.color, stroke: "var(--surface)", strokeWidth: 1 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </section>
      ))}
    </div>
  );
}

export default function PerformanceChart({
  data,
  metric,
  onMetricChange,
  metricLabel,
  periodLabel,
  exerciseLabel,
}: {
  data: PerformancePoint[];
  metric: Metric;
  onMetricChange: (metric: Metric) => void;
  metricLabel: string;
  periodLabel: string;
  exerciseLabel: string;
}) {
  return (
    <article className="min-w-0 rounded-2xl border border-border bg-surface p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Performance Over Time
          </h2>
          <p className="mt-1 text-sm text-muted">
            {metric === "all" ? "Separate scales" : metricLabel} · {periodLabel}
          </p>
        </div>

        <label className="relative flex w-full shrink-0 items-center sm:hidden">
          <span className="sr-only">Performance metric</span>
          <select
            value={metric}
            onChange={(event) => onMetricChange(event.target.value as Metric)}
            className="h-10 w-full appearance-none rounded-xl border border-border bg-background pl-3 pr-10 text-sm font-medium text-foreground outline-none transition-colors hover:border-foreground/40 focus:border-brand"
          >
            {METRICS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute right-3 text-muted"
          />
        </label>

        <div className="hidden w-fit flex-wrap rounded-xl border border-border bg-background p-1 sm:flex">
          {METRICS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onMetricChange(item.value)}
              aria-pressed={metric === item.value}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
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

      {metric === "all" && (
        <>
          <p className="mt-3 text-[11px] leading-4 text-muted">
            Each graph has its own scale. Hover a line for exact values.
          </p>
        </>
      )}

      <div className="mt-6 h-[300px] w-full sm:h-[350px]">
        {data.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <ChartNoAxesCombined
              size={30}
              className="text-muted"
              aria-hidden="true"
            />

            <p className="mt-3 text-sm font-semibold">
              Nothing to chart yet
            </p>

            <p className="mt-1 max-w-xs text-xs leading-5 text-muted">
              No sessions for {exerciseLabel} in this time range.
              Choose another range or log a workout.
            </p>
          </div>
        ) : metric === "all" ? (
          <AllMetricsCharts data={data} />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 12, right: 10, left: -18, bottom: 4 }}
            >
              <defs>
                <linearGradient
                  id="exerciseTrendFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--accent)"
                    stopOpacity={0.28}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--accent)"
                    stopOpacity={0.01}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="dateLabel"
                tick={{ fill: "var(--muted)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                minTickGap={24}
              />

              <YAxis
                width={48}
                allowDecimals={metric === "rate"}
                tickFormatter={(value: number) =>
                  formatNumber(value, metric === "rate" ? 1 : 0)
                }
                tick={{ fill: "var(--muted)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.date
                    ? formatDate(payload[0].payload.date)
                    : ""
                }
                formatter={(value) => {
                  const formatted =
                    metric === "duration"
                      ? `${formatNumber(Number(value))} min`
                      : formatNumber(Number(value), metric === "rate" ? 1 : 0);
                  return [formatted, metricLabel];
                }}
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  color: "var(--foreground)",
                  fontSize: 12,
                }}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--accent)"
                strokeWidth={2.5}
                fill="url(#exerciseTrendFill)"
                activeDot={{ r: 5, strokeWidth: 0 }}
                dot={{
                  r: 3,
                  fill: "var(--accent)",
                  strokeWidth: 0,
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <p className="mt-3 text-xs leading-5 text-muted">
        Each point represents a logged session. Sessions on the same
        date remain separate observations.
      </p>
    </article>
  );
}
