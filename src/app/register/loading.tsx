import AuthCard from "@/components/auth/auth-card";
import AuthFormSkeleton from "@/components/auth/auth-form-skeleton";

export default function RegistrationLoading() {
  return (
    <AuthCard mode="register" loading>
      <AuthFormSkeleton mode="register" />
    </AuthCard>
  );
}
