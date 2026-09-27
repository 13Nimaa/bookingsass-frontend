"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AuthBrandPanel } from "@/features/auth/components/auth-brand-panel";
import { AuthLogo } from "@/features/auth/components/auth-logo";
import { BusinessForm } from "@/features/business/components/business-form";
import { AuthError } from "@/components/shared/auth-error";
import { registerBusinessRequest } from "@/lib/api/endpoints/business.endpoints";
import { useAuthStore } from "@/features/auth/store/auth-store";
import type { AuthResponse } from "@/features/auth/types";
import type { BusinessInput } from "@/features/business/types";

export function RegisterBusinessContent() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  // Post-registration creation: backend upgrades the user to BusinessOwner
  // and rotates tokens. Without the BFF cookie the rotated session comes
  // back in the response body, so it must be applied to the auth store —
  // otherwise the rotated-out tokens would silently log the user out.
  const submitBusiness = async (input: BusinessInput): Promise<boolean> => {
    setError(null);
    try {
      const res = await registerBusinessRequest(input);

      if (res.status === 409) {
        setError("شما قبلاً یک کسب‌وکار ثبت کرده‌اید.");
        return false;
      }
      if (!res.ok) {
        await res.text().catch(() => "");
        setError("ایجاد کسب‌وکار انجام نشد. اطلاعات را بررسی کنید.");
        return false;
      }
      const data: AuthResponse = await res.json();
      useAuthStore.getState().applySession(data);
      return true;
    } catch {
      setError("اتصال به سرور ممکن نیست. لطفاً دوباره تلاش کنید.");
      return false;
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full bg-white lg:grid lg:grid-cols-2"
    >
      {/* =========================
          FORM
      ========================== */}

      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 sm:px-8 lg:px-12">
        {/* Soft primary glow — palette tint, not gray */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(560px_280px_at_50%_-80px,rgba(79,70,229,0.14),transparent)]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative w-full max-w-[520px]"
        >
          <div className="mb-8">
            <AuthLogo />
          </div>

          <div className="mb-8">
            <h1 className="text-[28px] font-bold text-[#111827]">
              اطلاعات آرایشگاه
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              اطلاعات آرایشگاه خود را وارد کنید تا حساب مدیریتی شما تکمیل شود.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-6">
            {error && (
              <div className="mb-5">
                <AuthError ref={errorRef} message={error} />
              </div>
            )}

            <BusinessForm
              mode="create"
              submit={submitBusiness}
              onDone={() => router.push("/dashboard/business")}
            />
          </div>
        </motion.div>
      </div>

      {/* =========================
          BRAND PANEL (pure code — no image)
      ========================== */}

      <AuthBrandPanel />
    </div>
  );
}
