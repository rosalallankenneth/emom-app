"use client";

import { useActionState } from "react";
import { registerAccount, type RegistrationState } from "@/actions/registration";

const initialState: RegistrationState = { success: false, message: "" };
const fieldClass = "mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-brand";

export default function RegistrationForm() {
  const [state, formAction, pending] = useActionState(registerAccount, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block text-sm font-medium" htmlFor="name">
        Name
        <input id="name" name="name" type="text" autoComplete="name" required maxLength={80} className={fieldClass} />
      </label>

      <label className="block text-sm font-medium" htmlFor="email">
        Email
        <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} className={fieldClass} />
      </label>

      <label className="block text-sm font-medium" htmlFor="password">
        Password
        <input id="password" name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} className={fieldClass} />
        <span className="mt-1 block text-xs font-normal text-muted">Use at least 12 characters.</span>
      </label>

      <label className="block text-sm font-medium" htmlFor="confirmPassword">
        Confirm password
        <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required minLength={12} maxLength={128} className={fieldClass} />
      </label>

      {state.message && (
        <p role={state.success ? "status" : "alert"} aria-live="polite" className={`rounded-xl border px-3 py-2 text-sm ${state.success ? "border-brand/50 text-foreground" : "border-danger-300 text-danger-700"}`}>
          {state.message}
        </p>
      )}

      <button type="submit" disabled={pending || state.success} className="h-11 w-full rounded-xl bg-brand px-4 text-sm font-bold text-brand-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
