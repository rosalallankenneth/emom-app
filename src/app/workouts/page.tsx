
import Link from "next/link";
import { notFound } from "next/navigation";

import AppShell from "@/components/app-shell";
import DeleteWorkoutButton from "@/components/delete-workout-button";
import EditWorkoutModal from "@/components/edit-workout-modal";
import WorkoutHistoryFilters from "@/components/workout-history-filters";
import { EXERCISES, getExerciseLabel } from "@/lib/exercises";
import { prisma } from "@/lib/prisma";

type SearchParams = Promise<{
  exercise?: string;
  from?: string;
  to?: string;
}>;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-PH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function isValidDate(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function formatNumber(value: number, maximumFractionDigits = 0) {
  return value.toLocaleString("en-PH", {
    maximumFractionDigits,
  });
}

export default async function WorkoutHistoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const exercise = EXERCISES.find(
    (item) => item.value === params.exercise,
  )?.value;

  const from = isValidDate(params.from) ? params.from : undefined;
  const to = isValidDate(params.to) ? params.to : undefined;

  if (from && to && from > to) {
    notFound();
  }

  const workoutDate: { gte?: Date; lt?: Date } = {};

  if (from) {
    workoutDate.gte = new Date(`${from}T00:00:00.000Z`);
  }

  if (to) {
    const end = new Date(`${to}T00:00:00.000Z`);
    end.setUTCDate(end.getUTCDate() + 1);
    workoutDate.lt = end;
  }

  const workouts = await prisma.workoutSession.findMany({
    where: {
      ...(exercise ? { exercise } : {}),
      ...(from || to ? { workoutDate } : {}),
    },
    orderBy: [
      { workoutDate: "desc" },
      { createdAt: "desc" },
    ],
  });

  const sessionCount = workouts.length;

  const totalDuration = workouts.reduce(
    (total, workout) => total + workout.durationMinutes,
    0,
  );

  const totalReps = workouts.reduce(
    (total, workout) =>
      total + workout.durationMinutes * workout.repsPerMinute,
    0,
  );

  const averageDuration =
    sessionCount > 0 ? totalDuration / sessionCount : null;

  const averageRepsPerMinute =
    sessionCount > 0
      ? workouts.reduce(
          (total, workout) => total + workout.repsPerMinute,
          0,
        ) / sessionCount
      : null;

  const averageReps =
    sessionCount > 0 ? totalReps / sessionCount : null;

  const sessionsByExercise = new Map<
    string,
    { label: string; count: number }
  >();

  for (const item of EXERCISES) {
    sessionsByExercise.set(item.value, {
      label: item.label,
      count: 0,
    });
  }

  for (const workout of workouts) {
    const stats = sessionsByExercise.get(workout.exercise);

    if (stats) {
      stats.count += 1;
    }
  }

  // Preserve the fixed exercise order when session counts are tied.
  const mostTrained = EXERCISES
    .map((item) => sessionsByExercise.get(item.value)!)
    .reduce(
      (best, current) =>
        current.count > best.count ? current : best,
      { label: "—", count: 0 },
    );

  const longestWorkout = workouts.reduce<
    (typeof workouts)[number] | null
  >(
    (best, workout) =>
      !best || workout.durationMinutes > best.durationMinutes
        ? workout
        : best,
    null,
  );

  const highestRepsPerMinute = workouts.reduce<
    (typeof workouts)[number] | null
  >(
    (best, workout) =>
      !best || workout.repsPerMinute > best.repsPerMinute
        ? workout
        : best,
    null,
  );

  const highestTotalReps = workouts.reduce<
    (typeof workouts)[number] | null
  >(
    (best, workout) => {
      const reps = workout.durationMinutes * workout.repsPerMinute;

      const bestReps = best
        ? best.durationMinutes * best.repsPerMinute
        : -1;

      return !best || reps > bestReps ? workout : best;
    },
    null,
  );

  const summaryCards = [
    {
      label: "Most trained",
      value: mostTrained.count > 0 ? mostTrained.label : "—",
      detail:
        mostTrained.count > 0
          ? `${mostTrained.count} ${
              mostTrained.count === 1 ? "session" : "sessions"
            }`
          : "No sessions",
    },
    {
      label: "Longest session",
      value: longestWorkout
        ? `${longestWorkout.durationMinutes} min`
        : "—",
      detail: longestWorkout
        ? getExerciseLabel(longestWorkout.exercise)
        : "No sessions",
    },
    {
      label: "Highest reps/min",
      value: highestRepsPerMinute
        ? formatNumber(highestRepsPerMinute.repsPerMinute)
        : "—",
      detail: highestRepsPerMinute
        ? getExerciseLabel(highestRepsPerMinute.exercise)
        : "No sessions",
    },
    {
      label: "Most reps in a session",
      value: highestTotalReps
        ? formatNumber(
            highestTotalReps.durationMinutes *
              highestTotalReps.repsPerMinute,
          )
        : "—",
      detail: highestTotalReps
        ? getExerciseLabel(highestTotalReps.exercise)
        : "No sessions",
    },
    {
      label: "Avg. duration",
      value:
        averageDuration !== null
          ? `${formatNumber(averageDuration, 1)} min`
          : "—",
      detail: "Per session",
    },
    {
      label: "Avg. reps/min",
      value:
        averageRepsPerMinute !== null
          ? formatNumber(averageRepsPerMinute, 1)
          : "—",
      detail: "Per session",
    },
    {
      label: "Avg. total reps",
      value:
        averageReps !== null
          ? formatNumber(averageReps, 1)
          : "—",
      detail: "Per session",
    },
  ];

  return (
    <AppShell>
      <div className="space-y-7">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
            Training log
          </p>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Workout history
              </h1>
              <p className="mt-2 text-sm text-muted">
                Review and manage your completed sessions.
              </p>
            </div>

            <p className="text-sm text-muted">
              {sessionCount}{" "}
              {sessionCount === 1 ? "session" : "sessions"}
            </p>
          </div>
        </header>

        <WorkoutHistoryFilters
          initialExercise={exercise ?? ""}
          initialFrom={from ?? ""}
          initialTo={to ?? ""}
        />

        {/* Compact workout statistics */}
        <section aria-label="Workout statistics">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
            {summaryCards.map((card) => (
              <article
                key={card.label}
                className="min-w-0 rounded-xl border border-border bg-surface px-3 py-3"
              >
                <p className="text-[11px] font-medium leading-4 text-muted">
                  {card.label}
                </p>

                <p
                  className="mt-1.5 break-words text-lg font-semibold leading-6 tracking-tight tabular-nums"
                  title={card.value}
                >
                  {card.value}
                </p>

                <p className="mt-1 truncate text-[11px] leading-4 text-muted">
                  {card.detail}
                </p>
              </article>
            ))}
          </div>
        </section>


        {/* Workout history with independently scrollable rows */}
        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex flex-col gap-1 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold">Workout sessions</h2>
            <p className="text-xs text-muted">
              Newest sessions first
            </p>
          </div>

          {workouts.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <h3 className="text-lg font-semibold">
                No sessions found
              </h3>
              <p className="mt-2 text-sm text-muted">
                Try changing your filters, or log a workout from the dashboard.
              </p>
              <Link
                href="/"
                className="mt-5 inline-flex h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-brand-foreground"
              >
                Back to dashboard
              </Link>
            </div>
          ) : (
            <>
              {/* Column headings stay visible while the rows scroll */}
              <div className="hidden grid-cols-[1.4fr_1fr_0.65fr_0.65fr_0.7fr_1fr] gap-4 border-b border-border bg-background/70 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted lg:grid">
                <span>Exercise</span>
                <span>Date</span>
                <span>Duration</span>
                <span>Reps/min</span>
                <span>Total reps</span>
                <span className="text-right">Actions</span>
              </div>

              <div className="max-h-[520px] divide-y divide-border overflow-y-auto overscroll-contain">
                {workouts.map((workout) => (
                  <article
                    key={workout.id}
                    className="grid gap-4 px-5 py-5 lg:grid-cols-[1.4fr_1fr_0.65fr_0.65fr_0.7fr_1fr] lg:items-center"
                  >
                    <div className="min-w-0">
                      <h3 className="font-semibold">
                        {getExerciseLabel(workout.exercise)}
                      </h3>

                      {workout.externalLoadKg != null &&
                        workout.externalLoadKg > 0 && (
                          <p className="mt-1 text-xs text-muted">
                            External load: {workout.externalLoadKg} kg
                          </p>
                        )}

                      {workout.notes && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted">
                          {workout.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between gap-3 text-sm lg:block">
                      <span className="text-muted lg:hidden">
                        Date
                      </span>
                      {formatDate(workout.workoutDate)}
                    </div>

                    <div className="flex justify-between gap-3 text-sm lg:block">
                      <span className="text-muted lg:hidden">
                        Duration
                      </span>
                      {workout.durationMinutes} min
                    </div>

                    <div className="flex justify-between gap-3 text-sm lg:block">
                      <span className="text-muted lg:hidden">
                        Reps/min
                      </span>
                      {workout.repsPerMinute}
                    </div>

                    <div className="flex justify-between gap-3 text-sm font-semibold tabular-nums lg:block">
                      <span className="font-normal text-muted lg:hidden">
                        Total reps
                      </span>
                      {formatNumber(
                        workout.durationMinutes *
                          workout.repsPerMinute,
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <EditWorkoutModal
                        workout={{
                          id: workout.id,
                          exercise: workout.exercise,
                          workoutDate: workout.workoutDate
                            .toISOString()
                            .slice(0, 10),
                          durationMinutes: workout.durationMinutes,
                          repsPerMinute: workout.repsPerMinute,
                          externalLoadKg: workout.externalLoadKg,
                          notes: workout.notes,
                        }}
                      />
                      <DeleteWorkoutButton id={workout.id} />
                    </div>
                  </article>
                ))}
              </div>

              {/* Footer stays outside the scrollable rows */}
              <footer className="border-t-2 border-brand/40 bg-surface px-5 py-4 text-foreground">
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-[1.4fr_1fr_0.65fr_0.65fr_0.7fr_1fr] lg:items-center lg:gap-4">
                  <div className="font-bold uppercase tracking-wider">
                    TOTAL
                    <p className="mt-1 text-xs font-normal normal-case tracking-normal text-muted">
                      {sessionCount}{" "}
                      {sessionCount === 1 ? "session" : "sessions"}
                    </p>
                  </div>

                  <div className="flex justify-between gap-3 text-sm lg:block">
                    <span className="text-muted lg:hidden">
                      Date
                    </span>
                    <span className="text-muted">—</span>
                  </div>

                  <div className="flex justify-between gap-3 text-sm font-semibold tabular-nums lg:block">
                    <span className="font-normal text-muted lg:hidden">
                      Total duration
                    </span>
                    <span>{formatNumber(totalDuration)} min</span>
                  </div>

                  <div className="flex justify-between gap-3 text-sm lg:block">
                    <span className="text-muted lg:hidden">
                      Reps/min
                    </span>
                    <span className="text-muted">—</span>
                  </div>

                  <div className="flex justify-between gap-3 text-sm font-bold tabular-nums lg:block">
                    <span className="font-normal text-muted lg:hidden">
                      Total reps
                    </span>
                    {formatNumber(totalReps)}
                  </div>

                  <div className="hidden lg:block" />
                </div>
              </footer>
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}