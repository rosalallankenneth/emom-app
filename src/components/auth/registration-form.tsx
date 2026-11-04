"use client";

import { useActionState } from "react";
import { registerAccount, type RegistrationState } from "@/actions/registration";
import FormMessage from "@/components/auth/form-message";

const initialState: RegistrationState = { success: false, message: "" };
const fieldClass = "mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

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
        <FormMessage
          type={state.success ? "success" : "error"}
          title={state.success ? "Account created" : "We couldn’t create your account"}
        >
          {state.message}
        </FormMessage>
      )}

      <button type="submit" disabled={pending || state.success} className="h-11 w-full rounded-xl bg-brand px-4 text-sm font-bold text-brand-foreground outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
