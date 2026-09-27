"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Store, UserRound } from "lucide-react";
import { AuthBrandPanel } from "@/features/auth/components/auth-brand-panel";
import { AuthLogo } from "@/features/auth/components/auth-logo";

// Local page state only. Not stored in Zustand, not sent to backend.
export type SignupIntent = "customer" | "business";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

function IntentOption({
  icon,
  title,
  description,
  onSelect,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onSelect: () => void;
}) {
  return (
    <motion.div variants={itemVariants}>
      <button
        type="button"
        onClick={onSelect}
        className="
          group
          flex
          w-full
          items-center
          gap-4
          rounded-2xl
          border
          border-[#E5E7EB]
          bg-white
          p-4
          text-right
          shadow-[0_1px_2px_rgba(0,0,0,0.04)]
          transition-all
          hover:-translate-y-0.5
          hover:border-[#6366F1]
          hover:shadow-[0_8px_24px_-12px_rgba(79,70,229,0.35)]
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-[#4F46E5]
          active:translate-y-0
        "
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#4F46E5] transition-colors group-hover:bg-[#4F46E5] group-hover:text-white">
          {icon}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-[#111827]">
            {title}
          </span>
          <span className="mt-1 block text-xs leading-5 text-[#6B7280]">
            {description}
          </span>
        </span>

        <ArrowLeft className="h-4 w-4 shrink-0 text-[#9CA3AF] transition-all group-hover:-translate-x-1 group-hover:text-[#4F46E5]" />
      </button>
    </motion.div>
  );
}

export function SignupIntentSelection({
  onSelect,
}: {
  onSelect: (intent: SignupIntent) => void;
}) {
  return (
    <div
      dir="rtl"
      className="min-h-screen w-full bg-white lg:grid lg:grid-cols-2"
    >
      {/* =========================
          INTENT SELECTION
      ========================== */}

      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 sm:px-8 lg:px-12">
        {/* Soft primary glow — palette tint, not gray */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(560px_280px_at_50%_-80px,rgba(79,70,229,0.14),transparent)]"
        />
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative w-full max-w-[420px]"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <AuthLogo />
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-[28px] font-bold text-[#111827]">
              ساخت حساب کاربری
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              برای شروع، مشخص کنید می‌خواهید به عنوان مشتری نوبت رزرو
              کنید یا آرایشگاه خود را مدیریت کنید.
            </p>
          </motion.div>

          <div className="space-y-3">
            <IntentOption
              icon={<UserRound className="h-5 w-5" />}
              title="ثبت‌نام به عنوان مشتری"
              description="رزرو نوبت از سالن‌ها و پیگیری نوبت‌های خود."
              onSelect={() => onSelect("customer")}
            />

            <IntentOption
              icon={<Store className="h-5 w-5" />}
              title="ثبت‌نام به عنوان مدیر آرایشگاه"
              description="ثبت سالن و مدیریت خدمات، مشتریان و نوبت‌ها."
              onSelect={() => onSelect("business")}
            />
          </div>

          <motion.p
            variants={itemVariants}
            className="mt-7 text-center text-sm text-[#6B7280]"
          >
            قبلاً ثبت‌نام کرده‌اید؟{" "}
            <a
              href="/login"
              className="
                font-medium
                text-[#4F46E5]
                transition
                hover:text-[#4338CA]
              "
            >
              وارد شوید
            </a>
          </motion.p>

          <motion.p
            variants={itemVariants}
            className="mt-10 text-center text-[11px] leading-5 text-[#9CA3AF]"
          >
            با ایجاد حساب، با شرایط استفاده و حریم خصوصی موافقت می‌کنید.
          </motion.p>
        </motion.div>
      </div>

      {/* =========================
          BRAND PANEL (pure code — no image)
      ========================== */}

      <AuthBrandPanel />
    </div>
  );
}
