"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scissors } from "lucide-react";
import { AuthFormSplitScreen, type SignupFormValues } from "@/components/auth/Login";
import { useAuthStore } from "@/store/auth-store";

export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useAuthStore((s) => s.register);

  const handleSignup = async (data: SignupFormValues) => {
    const ok = await registerUser(
      data.name,
      data.email,
      data.password,
      data.confirmPassword
    );

    if (!ok) {
      throw new Error(
        useAuthStore.getState().error ??
          "ثبت‌نام انجام نشد. اطلاعات را بررسی کنید."
      );
    }

    router.push("/dashboard");
  };

  return (
    <AuthFormSplitScreen
      mode="signup"
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
      title="ساخت حساب کاربری"
      description="همین حالا حساب خود را بسازید و مدیریت آرایشگاه را شروع کنید."
      imageSrc="/images/login-barbershop.jpg"
      imageAlt="فضای مدرن آرایشگاه"
      loginHref="/login"
      onSubmit={handleSignup}
    />
  );
}
