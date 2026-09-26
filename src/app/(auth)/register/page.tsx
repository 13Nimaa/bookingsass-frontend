"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Scissors,
  Store,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import { AuthFormSplitScreen, type SignupFormValues } from "@/components/auth/Login";
import { useAuthStore } from "@/store/auth-store";

// Local page state only (Task 3). Not stored in Zustand, not sent to backend.
type SignupIntent = "customer" | "business";

const IMAGE_SRC = "/images/login-barbershop.jpg";

function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5">
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
  );
}

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

    router.push("/");
  };

  if (intent === null) {
    return (
      <div
        dir="rtl"
        className="min-h-screen w-full bg-[#F8F9FB] lg:grid lg:grid-cols-2"
      >
        {/* =========================
            INTENT SELECTION
        ========================== */}

        <div className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-[420px]"
          >
            <motion.div variants={itemVariants} className="mb-8">
              <Logo />
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
                onSelect={() => setIntent("customer")}
              />

              <IntentOption
                icon={<Store className="h-5 w-5" />}
                title="ثبت‌نام به عنوان مدیر آرایشگاه"
                description="ثبت سالن و مدیریت خدمات، مشتریان و نوبت‌ها."
                onSelect={() => setIntent("business")}
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
            BRAND PANEL
        ========================== */}

        <div className="relative hidden overflow-hidden lg:block">
          <Image
            src={IMAGE_SRC}
            alt="فضای مدرن آرایشگاه"
            fill
            priority
            className="object-cover"
            sizes="50vw"
          />

          <div className="absolute inset-0 bg-[#111827]/35" />

          <div className="absolute inset-0 flex items-end p-12 xl:p-16">
            <div className="max-w-lg text-white">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 backdrop-blur-md">
                  <CalendarDays className="h-5 w-5" />
                </div>

                <span className="text-sm font-medium text-white/90">
                  مدیریت هوشمند آرایشگاه
                </span>
              </div>

              <h2 className="text-3xl font-bold leading-tight xl:text-4xl">
                همه چیز برای مدیریت بهتر
                <br />
                در یکجا.
              </h2>

              <p className="mt-4 max-w-md text-sm leading-7 text-white/75">
                مشتری‌ها، نوبت‌ها، خدمات و عملکرد کسب‌وکارتان را ساده‌تر و
                حرفه‌ای‌تر مدیریت کنید.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                  <Users className="mb-2 h-4 w-4 text-white/80" />

                  <p className="text-xs text-white/70">مدیریت مشتریان</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                  <CalendarDays className="mb-2 h-4 w-4 text-white/80" />

                  <p className="text-xs text-white/70">رزرو و نوبت‌دهی</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                  <TrendingUp className="mb-2 h-4 w-4 text-white/80" />

                  <p className="text-xs text-white/70">گزارش عملکرد</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
        logo={<Logo />}
        title="ساخت حساب کاربری"
        description="همین حالا حساب خود را بسازید و مدیریت آرایشگاه را شروع کنید."
        imageSrc={IMAGE_SRC}
        imageAlt="فضای مدرن آرایشگاه"
        loginHref="/login"
        onSubmit={handleSignup}
      />
    </div>
  );
}
