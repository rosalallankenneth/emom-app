import "server-only";

import { createHmac } from "node:crypto";

import { prisma } from "@/lib/prisma";

const WINDOW_SECONDS = 15 * 60;

function makeKey(scope: string, subject: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required for auth rate limiting.");

  const digest = createHmac("sha256", secret)
    .update(`${scope}:${subject.trim().toLowerCase()}`)
    .digest("hex");

  return `${scope}:${digest}`;
}

export function getClientIp(requestHeaders: Pick<globalThis.Headers, "get">) {
  const realIp = requestHeaders.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return requestHeaders
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim() || null;
}

async function consume(key: string, limit: number) {
  const rows = await prisma.$queryRaw<Array<{ count: number }>>`
    INSERT INTO "AuthRateLimit" ("key", "count", "windowStartedAt")
    VALUES (${key}, 1, CURRENT_TIMESTAMP)
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "AuthRateLimit"."windowStartedAt" <= CURRENT_TIMESTAMP - (${WINDOW_SECONDS} * INTERVAL '1 second')
          THEN 1
        ELSE "AuthRateLimit"."count" + 1
      END,
      "windowStartedAt" = CASE
        WHEN "AuthRateLimit"."windowStartedAt" <= CURRENT_TIMESTAMP - (${WINDOW_SECONDS} * INTERVAL '1 second')
          THEN CURRENT_TIMESTAMP
        ELSE "AuthRateLimit"."windowStartedAt"
      END
    RETURNING "count"
  `;

  return (rows[0]?.count ?? limit + 1) > limit;
}

export async function isAuthAttemptLimited({
  scope,
  email,
  ip,
  emailLimit,
  ipLimit,
}: {
  scope: "login" | "registration";
  email?: string;
  ip?: string | null;
  emailLimit: number;
  ipLimit: number;
}) {
  const checks: Promise<boolean>[] = [];

  if (email) {
    checks.push(consume(makeKey(`${scope}:email`, email), emailLimit));
  }

  if (ip) {
    checks.push(consume(makeKey(`${scope}:ip`, ip), ipLimit));
  }

  const limited = (await Promise.all(checks)).some(Boolean);

  // Keep one short-lived counter per active email/IP rather than retaining old keys forever.
  if (Math.random() < 0.02) {
    await prisma.authRateLimit.deleteMany({
      where: {
        windowStartedAt: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });
  }

  return limited;
}
