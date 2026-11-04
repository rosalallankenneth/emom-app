import Link from "next/link";
import { Dumbbell } from "lucide-react";

export default function AuthCard({
  mode,
  children,
  loading = false,
}: {
  mode: "login" | "register";
  children: React.ReactNode;
  loading?: boolean;
}) {
  const isLogin = mode === "login";

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 text-foreground">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-52 left-1/2 size-[34rem] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute -bottom-48 -right-40 size-[30rem] rounded-full bg-brand/5 blur-3xl" />
        <div className="auth-grid-background absolute inset-0" />
      </div>

      <div className="relative w-full max-w-md">
        <Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-brand text-lg font-black text-brand-foreground">
            E
          </span>
          <span>
            <span className="block text-sm font-bold tracking-tight">EMOM</span>
            <span className="block text-xs text-muted">Training journal</span>
          </span>
        </Link>

        <p className="mb-5 flex items-center justify-center gap-2 text-xs font-medium text-muted">
          <Dumbbell size={14} className="text-brand" aria-hidden="true" />
          <span>Log sessions. Build consistency.</span>
          <span className="flex gap-1" aria-hidden="true">
            <span className="size-1 rounded-full bg-brand/40" />
            <span className="size-1 rounded-full bg-brand/70" />
            <span className="size-1 rounded-full bg-brand" />
          </span>
        </p>

        <section className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-2xl shadow-black/10 sm:p-8">
          <div aria-hidden="true" className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-brand/70 to-transparent" />

          {loading ? (
            <div aria-hidden="true" className="animate-pulse">
              <div className="h-3 w-32 rounded bg-border" />
              <div className="mt-4 h-8 w-56 rounded bg-border" />
              <div className="mt-3 h-4 w-full rounded bg-border" />
              <div className="mt-1.5 h-4 w-4/5 rounded bg-border" />
            </div>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
                Personal workspace
              </p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight">
                {isLogin ? "Welcome back" : "Create your account"}
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted">
                {isLogin
                  ? "Sign in to continue your training journal."
                  : "Set up an account to keep your training history in one place."}
              </p>
            </>
          )}

          <div className="mt-7">{children}</div>

          {loading ? (
            <div aria-hidden="true" className="mt-6 flex animate-pulse justify-center border-t border-border pt-5">
              <div className="h-4 w-48 rounded bg-border" />
            </div>
          ) : (
            <p className="mt-6 border-t border-border pt-5 text-center text-sm text-muted">
              {isLogin ? "New to EMOM?" : "Already have an account?"}{" "}
              <Link
                href={isLogin ? "/register" : "/login"}
                className="font-semibold text-foreground underline decoration-brand underline-offset-4 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {isLogin ? "Create an account" : "Sign in"}
              </Link>
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
