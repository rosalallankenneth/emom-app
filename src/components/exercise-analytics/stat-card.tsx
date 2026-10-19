
"use client";

import {
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import { getChange } from "./analytics-utils";

function ChangeLabel({
  current,
  previous,
}: {
  current: number;
  previous: number;
}) {
  const change = getChange(current, previous);

  if (change === null) {
    return (
      <span className="text-xs text-muted">
        No previous activity
      </span>
    );
  }

  if (change === 0) {
    return (
      <span className="text-xs text-muted">
        No change vs. previous period
      </span>
    );
  }

  const positive = change > 0;
  const Icon = positive ? TrendingUp : TrendingDown;

  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted">
      <Icon size={13} aria-hidden="true" />
      {positive ? "+" : ""}
      {change.toFixed(1)}% vs. previous period
    </span>
  );
}

export default function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  comparison,
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  comparison?: { current: number; previous: number } | null;
}) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{label}</p>

        <span className="flex size-9 items-center justify-center rounded-xl bg-background text-muted">
          <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
        </span>
      </div>

      <p className="mt-5 text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
        {value}
      </p>

      <p className="mt-2 text-xs text-muted">{detail}</p>

      {comparison && (
        <div className="mt-3">
          <ChangeLabel
            current={comparison.current}
            previous={comparison.previous}
          />
        </div>
      )}
    </article>
  );
}
