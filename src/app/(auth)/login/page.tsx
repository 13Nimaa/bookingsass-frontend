// app/login/page.tsx

"use client";

import { useRouter } from "next/navigation";
import { AuthFormSplitScreen, type LoginFormValues } from "@/features/auth/components/Login";
import { AuthLogo } from "@/features/auth/components/auth-logo";
import { useAuthStore } from "@/features/auth/store/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const handleLogin = async (data: LoginFormValues) => {
    const ok = await login(data.phoneNumber, data.password);

    if (!ok) {
      throw new Error(
        useAuthStore.getState().error ??
          "ورود انجام نشد. لطفاً اطلاعات خود را بررسی کنید."
      );
    }

    const redirect = new URLSearchParams(window.location.search).get(
      "redirect"
    );
    const target =
      redirect && redirect.startsWith("/") && !redirect.startsWith("//")
        ? redirect
        : "/";

    router.push(target);
  };

  return (
    <AuthFormSplitScreen
      logo={<AuthLogo />}
      title="خوش آمدید"
      description="برای ورود به پنل مدیریت آرایشگاه، اطلاعات حساب خود را وارد کنید."
      forgotPasswordHref="/forgot-password"
      createAccountHref="/register"
      onSubmit={handleLogin}
    />
  );
}
