"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AuthFormSplitScreen, type SignupFormValues } from "@/features/auth/components/Login";
import { AuthLogo } from "@/features/auth/components/auth-logo";
import {
  SignupIntentSelection,
  type SignupIntent,
} from "@/features/auth/components/signup-intent-selection";
import { useAuthStore } from "@/features/auth/store/auth-store";

export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useAuthStore((s) => s.register);
  const [intent, setIntent] = React.useState<SignupIntent | null>(null);

  const handleSignup = async (data: SignupFormValues) => {
    const ok = await registerUser(
      data.name,
      data.phoneNumber,
      data.password,
      data.confirmPassword
    );

    if (!ok) {
      throw new Error(
        useAuthStore.getState().error ??
          "ثبت‌نام انجام نشد. اطلاعات را بررسی کنید."
      );
    }

    // Local navigation only — intent is never sent to the backend.
    if (intent === "business") {
      router.push("/register/business");
    } else {
      router.push("/");
    }
  };

  if (intent === null) {
    return <SignupIntentSelection onSelect={setIntent} />;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIntent(null)}
        className="
          absolute
          right-5
          top-5
          z-10
          inline-flex
          items-center
          gap-1.5
          rounded-xl
          border
          border-[#E5E7EB]
          bg-white/90
          px-3
          py-2
          text-xs
          font-medium
          text-[#4B5563]
          shadow-[0_1px_2px_rgba(0,0,0,0.05)]
          backdrop-blur-md
          transition
          hover:border-[#6366F1]
          hover:text-[#4F46E5]
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-[#4F46E5]
        "
      >
        <ArrowRight className="h-3.5 w-3.5" />
        تغییر نوع ثبت‌نام
      </button>

      <AuthFormSplitScreen
        mode="signup"
        logo={<AuthLogo />}
        title="ساخت حساب کاربری"
        description="همین حالا حساب خود را بسازید و مدیریت آرایشگاه را شروع کنید."
        loginHref="/login"
        onSubmit={handleSignup}
      />
    </div>
  );
}
