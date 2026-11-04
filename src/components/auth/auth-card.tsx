import Link from "next/link";

export default function AuthCard({
  mode,
  children,
}: {
  mode: "login" | "register";
  children: React.ReactNode;
}) {
  const isLogin = mode === "login";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="w-full max-w-md">
        <Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-brand text-lg font-black text-brand-foreground">
            E
          </span>
          <span>
            <span className="block text-sm font-bold tracking-tight">EMOM</span>
            <span className="block text-xs text-muted">Training journal</span>
          </span>
        </Link>

        <section className="rounded-2xl border border-border bg-surface p-6 shadow-xl sm:p-8">
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

          <div className="mt-7">{children}</div>

          <p className="mt-6 border-t border-border pt-5 text-center text-sm text-muted">
            {isLogin ? "New to EMOM?" : "Already have an account?"}{" "}
            <Link
              href={isLogin ? "/register" : "/login"}
              className="font-semibold text-foreground underline decoration-brand underline-offset-4 hover:text-brand"
            >
              {isLogin ? "Create an account" : "Sign in"}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
