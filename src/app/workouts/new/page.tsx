
import Link from "next/link";

import WorkoutForm from "./workout-form";

export const metadata = {
  title: "Log Workout | EMOM Tracker",
  description: "Record a completed EMOM workout.",
};

export default function NewWorkoutPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="text-sm text-default-500 hover:text-foreground"
      >
        ← Back to dashboard
      </Link>

      <header className="mb-8 mt-6">
        <p className="text-sm font-medium text-default-500">
          WORKOUTS
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Log a workout
        </h1>

        <p className="mt-2 text-default-500">
          Record your completed session, minute by minute.
        </p>
      </header>

      <div className="rounded-2xl border border-default-200 p-5 sm:p-8">
        <WorkoutForm />
      </div>
    </main>
  );
}
