
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-6">
        <div>
          <p className="text-sm font-medium text-default-500">
            PERSONAL FITNESS
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            EMOM Tracker
          </h1>

          <p className="mt-3 text-default-500">
            Track your workouts, record every minute, and monitor
            your progress over time.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/workouts/new"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            Log a workout
          </Link>
        </div>
      </div>
    </main>
  );
}