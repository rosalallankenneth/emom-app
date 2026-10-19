
import type { ReactNode } from "react";
import {
  Activity,
  CalendarDays,
  Repeat2,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import type { ExerciseSession } from "./analytics-utils";
import {
  formatDate,
  formatNumber,
  getTotalReps,
} from "./analytics-utils";

function InsightRow({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-background text-muted">
        <Icon size={17} aria-hidden="true" />
      </span>

      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted">{children}</p>
      </div>
    </div>
  );
}

export default function TrainingInsights({
  insight,
  activeDays,
  currentSessionCount,
  bestRate,
  bestVolume,
}: {
  insight: string;
  activeDays: number;
  currentSessionCount: number;
  bestRate: ExerciseSession | null;
  bestVolume: ExerciseSession | null;
}) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-background text-muted">
          <Activity size={19} aria-hidden="true" />
        </span>

        <div>
          <h2 className="font-semibold">Training Insights</h2>
          <p className="mt-1 text-xs text-muted">
            Based on your logged sessions
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-border bg-background p-4">
        <p className="text-sm leading-6">{insight}</p>
      </div>

      <div className="mt-5 space-y-4">
        <InsightRow
          icon={CalendarDays}
          title="Training consistency"
        >
          {activeDays} {activeDays === 1 ? "day" : "days"} trained in
          this period across {currentSessionCount}{" "}
          {currentSessionCount === 1 ? "session" : "sessions"}.
        </InsightRow>

        <InsightRow icon={Trophy} title="Best pace">
          {bestRate
            ? `${bestRate.repsPerMinute} reps/min on ${formatDate(bestRate.workoutDate)}`
            : "Log a session to establish your best pace."}
        </InsightRow>

        <InsightRow
          icon={Repeat2}
          title="Highest session volume"
        >
          {bestVolume
            ? `${formatNumber(getTotalReps(bestVolume))} reps across ${bestVolume.durationMinutes} minutes on ${formatDate(bestVolume.workoutDate)}`
            : "Your highest-volume session will appear here."}
        </InsightRow>
      </div>
    </article>
  );
}
