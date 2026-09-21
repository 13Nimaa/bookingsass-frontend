import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "ورود - BookFlow",
};

export default function LoginPage() {
  return (
    <AuthLayout title="خوش آمدید" subtitle="برای ادامه وارد حساب کاربری خود شوید.">
      <LoginForm />
    </AuthLayout>
  );
}
