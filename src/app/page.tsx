
import AppShell from "@/components/app-shell";

export default function DashboardPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-5xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
          Overview
        </p>

        <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Your training, at a glance.
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-muted sm:text-base">
              A quieter way to track consistency, review your sessions,
              and decide what to train next.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-xs font-medium">
            <span className="size-2 rounded-full bg-brand" />
            WORKOUT JOURNAL
          </div>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-7">
            <p className="text-sm text-muted">Your training space</p>
            <h2 className="mt-3 text-xl font-semibold">
              Built around your routine.
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Eight fixed exercises. Simple session logging. Progress
              you can actually review.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-brand p-6 sm:p-7">
            <p className="text-sm text-brand-foreground/70">
              YOUR NEXT STEP
            </p>
            <h2 className="mt-3 text-xl font-semibold text-brand-foreground">
              Make every session count.
            </h2>
            <p className="mt-2 text-sm leading-6 text-brand-foreground/80">
              Your recommendations and workout logging will live here.
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
