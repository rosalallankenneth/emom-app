import AuthCard from "@/components/auth/auth-card";
import LoginForm from "@/components/auth/login-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSafeRedirectTo } from "@/lib/safe-redirect";

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string | string[];
    registered?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const requested = Array.isArray(params.callbackUrl)
    ? params.callbackUrl[0]
    : params.callbackUrl;
  const redirectTo = getSafeRedirectTo(requested);
  const session = await auth();

  if (session?.user?.id) {
    redirect(redirectTo);
  }

  return (
    <AuthCard mode="login">
      <LoginForm
        redirectTo={redirectTo}
        registrationComplete={params.registered === "1"}
      />
    </AuthCard>
  );
}
