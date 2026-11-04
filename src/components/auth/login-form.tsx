"use client";

import { useActionState } from "react";
import { authenticate, type AuthFormState } from "@/actions/auth";

const initialState: AuthFormState = { message: "" };
const fieldClass = "mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-brand";

export default function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState(authenticate, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <label className="block text-sm font-medium" htmlFor="email">
        Email
        <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} className={fieldClass} />
      </label>

      <label className="block text-sm font-medium" htmlFor="password">
        Password
        <input id="password" name="password" type="password" autoComplete="current-password" required maxLength={128} className={fieldClass} />
      </label>

      {state.message && (
        <p role="alert" aria-live="polite" className="rounded-xl border border-danger-300 px-3 py-2 text-sm text-danger-700">
          {state.message}
        </p>
      )}

      <button type="submit" disabled={pending} className="h-11 w-full rounded-xl bg-brand px-4 text-sm font-bold text-brand-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
