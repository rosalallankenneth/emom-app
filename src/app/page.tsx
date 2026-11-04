
import AppShell from "@/components/app-shell";
import DashboardOverview from "@/components/dashboard-overview";
import { getExerciseLabel } from "@/lib/exercises";

import { getDashboardData } from "@/lib/data/dashboard";
import type { DashboardPeriod } from "@/lib/dashboard-periods";
import { requireAuth } from "@/lib/require-auth";

import { ArrowUpRight } from "lucide-react";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function isDashboardPeriod(value: string): value is DashboardPeriod {
  return ["week", "month", "year", "all"].includes(value);
}

type DashboardPageProps = {
  searchParams: Promise<{ period?: string | string[] }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const requestedCallback = Array.isArray(params.period)
    ? params.period[0]
    : params.period;
  const callbackUrl = requestedCallback
    ? `/?period=${encodeURIComponent(requestedCallback)}`
    : "/";
  await requireAuth(callbackUrl);

  const requestedPeriod = Array.isArray(params.period)
    ? params.period[0]
    : params.period;

  const period: DashboardPeriod =
    requestedPeriod && isDashboardPeriod(requestedPeriod)
      ? requestedPeriod
      : "month";

  const {
    sessionCount,
    totalMinutes,
    totalReps,
    recentSessions,
    recommendations,
    exerciseStats,
  } = await getDashboardData(period);

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Page heading */}
        <section>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
            Overview
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Your training, at a glance.
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted">
            Keep track of your consistency, see what needs attention,
            and make your next session count.
          </p>
        </section>

        <DashboardOverview
          period={period}
          sessionCount={sessionCount}
          totalMinutes={totalMinutes}
          totalReps={totalReps}
          exerciseStats={exerciseStats}
          recommendations={recommendations}
        />

        {/* Recent sessions */}
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Recent sessions
              </h2>
              <p className="mt-1 text-sm text-muted">
                Your latest logged workouts.
              </p>
            </div>

            <span className="text-xs font-medium text-muted">
              Latest 5
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            {recentSessions.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-background text-muted">
                  <ArrowUpRight
                    size={22}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </div>

                <h3 className="mt-4 font-semibold">
                  Your first session starts here
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
                  Log a completed workout and your training history
                  will start appearing here.
                </p>
              </div>
            ) : (
              <>
                <div className="hidden grid-cols-[minmax(0,1.5fr)_1fr_0.7fr_0.8fr_0.7fr] gap-4 border-b border-border bg-background/70 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-muted md:grid">
                  <span>Exercise</span>
                  <span>Date</span>
                  <span>Duration</span>
                  <span>Reps / min</span>
                  <span>Total reps</span>
                </div>

                <div className="divide-y divide-border">
                  {recentSessions.map((session) => (
                    <article
                      key={session.id}
                      className="grid gap-3 px-5 py-4 transition-colors hover:bg-background/60 md:grid-cols-[minmax(0,1.5fr)_1fr_0.7fr_0.8fr_0.7fr] md:items-center md:gap-4 md:px-6"
                    >
                      <div>
                        <p className="font-semibold">
                          {getExerciseLabel(session.exercise)}
                        </p>
                        <p className="mt-1 text-xs text-muted md:hidden">
                          {formatDate(session.workoutDate)}
                        </p>
                      </div>

                      <p className="hidden text-sm text-muted md:block">
                        {formatDate(session.workoutDate)}
                      </p>

                      <div className="flex items-center justify-between md:block">
                        <span className="text-xs text-muted md:hidden">
                          Duration
                        </span>
                        <span className="text-sm">
                          {session.durationMinutes} min
                        </span>
                      </div>

                      <div className="flex items-center justify-between md:block">
                        <span className="text-xs text-muted md:hidden">
                          Reps per minute
                        </span>
                        <span className="text-sm tabular-nums">
                          {session.repsPerMinute}
                        </span>
                      </div>

                      <div className="flex items-center justify-between md:block">
                        <span className="text-xs text-muted md:hidden">
                          Total reps
                        </span>
                        <span className="text-sm font-semibold tabular-nums">
                          {(
                            session.durationMinutes *
                            session.repsPerMinute
                          ).toLocaleString("en-PH")}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Training reminder */}
        <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
              Keep the habit
            </p>

            <h2 className="mt-2 text-xl font-semibold text-foreground">
              Consistency beats the perfect plan.
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
              Log the work you actually did. Your progress should reflect
              your training, not an imaginary version of it.
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
