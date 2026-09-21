import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "ثبت‌نام - BookFlow",
};

export default function RegisterPage() {
  return (
    <AuthLayout title="ساخت حساب کاربری" subtitle="همین حالا با BookFlow شروع کنید.">
      <RegisterForm />
    </AuthLayout>
  );
}
