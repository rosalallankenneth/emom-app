"use server";

import argon2 from "argon2";
import { Prisma } from "@/generated/prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

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
  const parsed = registrationSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
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
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        passwordHash: await argon2.hash(parsed.data.password, {
          type: argon2.argon2id,
        }),
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

  return {
    success: true,
    message: "Account created. Sign in to start tracking your training.",
  };
}
