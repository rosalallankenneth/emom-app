import AuthCard from "@/components/auth/auth-card";
import RegistrationForm from "@/components/auth/registration-form";

export default function RegisterPage() {
  return (
    <AuthCard mode="register">
      <RegistrationForm />
    </AuthCard>
  );
}
