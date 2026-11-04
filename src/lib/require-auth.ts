import "server-only";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAuth(returnTo = "/") {
  const session = await auth();

  if (!session?.user?.id) {
    const callbackUrl = encodeURIComponent(returnTo);
    redirect(`/login?callbackUrl=${callbackUrl}`);
  }

  return session;
}
