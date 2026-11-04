import AuthCard from "@/components/auth/auth-card";
import AuthFormSkeleton from "@/components/auth/auth-form-skeleton";

export default function LoginLoading() {
  return (
    <AuthCard mode="login" loading>
      <AuthFormSkeleton mode="login" />
    </AuthCard>
  );
}
