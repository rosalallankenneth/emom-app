import AppShell from "@/components/app-shell";
import NewWorkoutModal from "@/components/new-workout-modal";
import { getExerciseLabel } from "@/lib/exercises";
import { getDashboardData } from "@/lib/data/dashboard";

import {
  Activity,
  ArrowUpRight,
  Clock3,
  Dumbbell,
  Repeat2,
} from "lucide-react";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr`;

  return `${hours} hr ${minutes} min`;
}

function formatLastPerformed(date: Date | null) {
  if (!date) return "Never logged";

  return `Last trained ${formatDate(date)}`;
}

export default async function DashboardPage() {
  const {
    sessionCount,
    totalMinutes,
    totalReps,
    recentSessions,
    recommendations,
  } = await getDashboardData();

  const stats = [
    {
      label: "Sessions logged",
      value: sessionCount.toLocaleString("en-PH"),
      detail: "Total completed workouts",
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

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Page heading */}
        <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
              Overview
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Your training, at a glance.
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
              Keep track of your consistency, see what needs attention,
              and make your next session count.
            </p>
          </div>

          <div className="shrink-0">
            <NewWorkoutModal />
          </div>
        </section>

        {/* Summary statistics */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Training overview</h2>
            <span className="text-xs text-muted">All time</span>
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
                    <stat.icon size={18} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                </div>

                <p className="mt-5 text-3xl font-semibold tracking-tight tabular-nums">
                  {stat.value}
                </p>

                <p className="mt-2 text-xs text-muted">
                  {stat.detail}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Exercise recommendations */}
        <section>
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                What to train next
              </h2>
              <p className="mt-1 text-sm text-muted">
                Your three least-recently-trained exercises.
              </p>
            </div>

            <span className="text-xs text-muted">
              Based on your workout history
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {recommendations.map((exercise, index) => (
              <article
                key={exercise.value}
                className={`rounded-2xl border p-5 ${
                  index === 0
                    ? "border-foreground bg-foreground text-white"
                    : "border-border bg-surface"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`flex size-9 items-center justify-center rounded-xl text-sm font-semibold ${
                      index === 0
                        ? "bg-brand text-brand-foreground"
                        : "bg-background text-foreground"
                    }`}
                  >
                    0{index + 1}
                  </span>

                  {exercise.lastPerformed === null && (
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                        index === 0
                          ? "bg-white/10 text-white"
                          : "bg-brand text-brand-foreground"
                      }`}
                    >
                      Not logged
                    </span>
                  )}
                </div>

                <h3 className="mt-6 flex items-center gap-2 text-lg font-semibold">
                  <Activity
                    size={18}
                    strokeWidth={1.8}
                    className="shrink-0 opacity-70"
                    aria-hidden="true"
                  />
                  {exercise.label}
                </h3>

                <p
                  className={`mt-1 text-xs ${
                    index === 0 ? "text-white/65" : "text-muted"
                  }`}
                >
                  {formatLastPerformed(exercise.lastPerformed)}
                </p>
              </article>
            ))}
          </div>
        </section>

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
                  <ArrowUpRight size={22} strokeWidth={1.8} aria-hidden="true" />
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
        <section className="flex flex-col gap-4 rounded-2xl bg-brand p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-foreground/65">
              Keep the habit
            </p>

            <h2 className="mt-2 text-xl font-semibold text-brand-foreground">
              Consistency beats the perfect plan.
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-brand-foreground/75">
              Log the work you actually did. Your progress should reflect
              your training, not an imaginary version of it.
            </p>
          </div>

          <NewWorkoutModal />
        </section>
      </div>
    </AppShell>
  );
}