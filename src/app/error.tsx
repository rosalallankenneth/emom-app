"use client";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-border bg-surface p-7 text-center sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Something went wrong</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">This page couldn’t load.</h1>
        <p className="mt-2 text-sm leading-6 text-muted">Try again. Your workout history is still saved.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 h-11 rounded-xl bg-brand px-5 text-sm font-bold text-brand-foreground outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
