"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

export type AuthFormState = {
  message: string;
};

export async function authenticate(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    await signIn("credentials", formData);
    return { message: "" };
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: "Email or password is incorrect." };
    }

    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
