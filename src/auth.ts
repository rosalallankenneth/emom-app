import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import argon2 from "argon2";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getClientIp, isAuthAttemptLimited } from "@/lib/auth-rate-limit";

const credentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials, request) {
        const emailCandidate =
          typeof rawCredentials?.email === "string"
            ? rawCredentials.email.trim().toLowerCase()
            : undefined;
        const rateLimited = await isAuthAttemptLimited({
          scope: "login",
          email: emailCandidate,
          ip: getClientIp(request.headers),
          emailLimit: 10,
          ipLimit: 40,
        });

        if (rateLimited) return null;

        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user?.passwordHash) return null;

        const passwordIsValid = await argon2.verify(
          user.passwordHash,
          parsed.data.password,
        );

        if (!passwordIsValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
});

declare module "next-auth" {
  interface Session {
    user: NonNullable<DefaultSession["user"]> & { id: string };
  }
}
