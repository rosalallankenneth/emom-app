
"use client";

import { ChartNoAxesCombined } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
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
            Performance over time
          </h2>
          <p className="mt-1 text-sm text-muted">
            {metricLabel} · {periodLabel}
          </p>
        </div>

        <div
          className="flex w-fit flex-wrap rounded-xl border border-border bg-background p-1"
          aria-label="Chart metric"
        >
          {METRICS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onMetricChange(item.value)}
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
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
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
                formatter={(value) => [
                  metric === "duration"
                    ? `${Number(value)} min`
                    : formatNumber(
                        Number(value),
                        metric === "rate" ? 1 : 0,
                      ),
                  metricLabel,
                ]}
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
            </AreaChart>
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
