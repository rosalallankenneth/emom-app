
import type { ExerciseSession } from "./analytics-utils";
import { formatDuration, formatNumber } from "./analytics-utils";
import TrainingActivityCalendar from "./training-activity-calendar";

export default function AllTimeOverview({
  sessions,
  exerciseLabel,
}: {
  sessions: ExerciseSession[];
  exerciseLabel: string;
}) {
  const totalMinutes = sessions.reduce(
    (sum, session) => sum + session.durationMinutes,
    0,
  );

  const totalReps = sessions.reduce(
    (sum, session) =>
      sum + session.durationMinutes * session.repsPerMinute,
    0,
  );

  const averageRate = sessions.length
    ? sessions.reduce(
        (sum, session) => sum + session.repsPerMinute,
        0,
      ) / sessions.length
    : 0;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">All-Time overview</h2>
        <p className="mt-1 text-sm text-muted">
          Your complete training history, regardless of the selected
          period.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <p className="text-sm text-muted">All-time training time</p>

          <p className="mt-3 text-2xl font-semibold tabular-nums">
            {formatDuration(totalMinutes)}
          </p>

          <p className="mt-2 text-xs text-muted">
            Across all {sessions.length} logged{" "}
            {sessions.length === 1 ? "session" : "sessions"} of{" "}
            {exerciseLabel.toLowerCase()}.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <p className="text-sm text-muted">All-time repetitions</p>

          <p className="mt-3 text-2xl font-semibold tabular-nums">
            {formatNumber(totalReps)}
          </p>

          <p className="mt-2 text-xs text-muted">
            Average pace of {formatNumber(averageRate, 1)} reps per
            minute across all sessions.
          </p>
        </article>
      </div>

      <TrainingActivityCalendar sessions={sessions} />
    </section>
  );
}
