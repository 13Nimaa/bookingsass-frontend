// app/login/page.tsx

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scissors } from "lucide-react";
import { AuthFormSplitScreen, type LoginFormValues } from "@/components/auth/Login";
import { useAuthStore } from "@/store/auth-store";

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
      logo={
        <Link
          href="/"
          className="inline-flex items-center gap-2.5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF2FF]">
            <Scissors className="h-5 w-5 text-[#4F46E5]" />
          </div>

          <div>
            <span className="block text-lg font-bold tracking-tight text-[#111827]">
              BarberCRM
            </span>

            <span className="block text-[11px] text-[#6B7280]">
              مدیریت هوشمند آرایشگاه
            </span>
          </div>
        </Link>
      }
      title="خوش آمدید"
      description="برای ورود به پنل مدیریت آرایشگاه، اطلاعات حساب خود را وارد کنید."
      imageSrc="/images/login-barbershop.jpg"
      imageAlt="فضای مدرن آرایشگاه"
      forgotPasswordHref="/forgot-password"
      createAccountHref="/register"
      onSubmit={handleLogin}
    />
  );
}
