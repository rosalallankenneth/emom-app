"use client";

import { useActionState } from "react";
import { authenticate, type AuthFormState } from "@/actions/auth";
import FormMessage from "@/components/auth/form-message";

const initialState: AuthFormState = { message: "" };
const fieldClass = "mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

export default function LoginForm({
  redirectTo,
  registrationComplete,
}: {
  redirectTo: string;
  registrationComplete: boolean;
}) {
  const [state, formAction, pending] = useActionState(authenticate, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {registrationComplete && (
        <FormMessage type="success" title="Account created">
          Your account is ready. Sign in to continue.
        </FormMessage>
      )}

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
        <FormMessage type="error" title="Sign-in failed">
          {state.message}
        </FormMessage>
      )}

      <button type="submit" disabled={pending} className="h-11 w-full rounded-xl bg-brand px-4 text-sm font-bold text-brand-foreground outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
