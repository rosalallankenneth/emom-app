"use server";

import argon2 from "argon2";
import { Prisma } from "@/generated/prisma/client";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getClientIp, isAuthAttemptLimited } from "@/lib/auth-rate-limit";

export type RegistrationState = {
  success: boolean;
  message: string;
};

const registrationSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    email: z.string().trim().email().max(254),
    password: z.string().min(12).max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export async function registerAccount(
  _previousState: RegistrationState,
  formData: FormData,
): Promise<RegistrationState> {
  const requestHeaders = await headers();
  const rawEmail = formData.get("email");
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : undefined;
  const rateLimited = await isAuthAttemptLimited({
    scope: "registration",
    email,
    ip: getClientIp(requestHeaders),
    emailLimit: 3,
    ipLimit: 5,
  });

  if (rateLimited) {
    return {
      success: false,
      message: "Too many attempts. Please try again in 15 minutes.",
    };
  }

  const parsed = registrationSchema.safeParse({
    name: formData.get("name"),
    email: rawEmail,
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Check the information and try again.",
    };
  }

  try {
    const passwordHash = await argon2.hash(parsed.data.password, {
      type: argon2.argon2id,
    });

    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        passwordHash,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "An account with that email already exists.",
      };
    }

    console.error("Failed to register account:", error);
    return {
      success: false,
      message: "Unable to create your account. Please try again.",
    };
  }

  redirect("/login?registered=1");
}
