
import Link from "next/link";
import { notFound } from "next/navigation";

import AppShell from "@/components/app-shell";
import DeleteWorkoutButton from "@/components/delete-workout-button";
import { EXERCISES, getExerciseLabel } from "@/lib/exercises";
import { prisma } from "@/lib/prisma";

import EditWorkoutModal from "@/components/edit-workout-modal";
import WorkoutHistoryFilters from "@/components/workout-history-filters";

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
              {workouts.length} {workouts.length === 1 ? "session" : "sessions"}
            </p>
          </div>
        </header>

        <WorkoutHistoryFilters
          initialExercise={exercise ?? ""}
          initialFrom={from ?? ""}
          initialTo={to ?? ""}
        />

        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          {workouts.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <h2 className="text-lg font-semibold">No sessions found</h2>
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
              <div className="hidden grid-cols-[1.4fr_1fr_0.65fr_0.65fr_0.7fr_1fr] gap-4 border-b border-border bg-background/70 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted lg:grid">
                <span>Exercise</span>
                <span>Date</span>
                <span>Duration</span>
                <span>Reps/min</span>
                <span>Total reps</span>
                <span className="text-right">Actions</span>
              </div>

              <div className="divide-y divide-border">
                {workouts.map((workout) => (
                  <article
                    key={workout.id}
                    className="grid gap-4 px-5 py-5 lg:grid-cols-[1.4fr_1fr_0.65fr_0.65fr_0.7fr_1fr] lg:items-center"
                  >
                    <div>
                      <h2 className="font-semibold">
                        {getExerciseLabel(workout.exercise)}
                      </h2>
                      {workout.externalLoadKg !== null && (
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
                      <span className="text-muted lg:hidden">Date</span>
                      {formatDate(workout.workoutDate)}
                    </div>

                    <div className="flex justify-between gap-3 text-sm lg:block">
                      <span className="text-muted lg:hidden">Duration</span>
                      {workout.durationMinutes} min
                    </div>

                    <div className="flex justify-between gap-3 text-sm lg:block">
                      <span className="text-muted lg:hidden">Reps/min</span>
                      {workout.repsPerMinute}
                    </div>

                    <div className="flex justify-between gap-3 text-sm font-semibold tabular-nums lg:block">
                      <span className="font-normal text-muted lg:hidden">
                        Total reps
                      </span>
                      {(workout.durationMinutes * workout.repsPerMinute).toLocaleString("en-PH")}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <EditWorkoutModal
                        workout={{
                          id: workout.id,
                          exercise: workout.exercise,
                          workoutDate: workout.workoutDate.toISOString().slice(0, 10),
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
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}
