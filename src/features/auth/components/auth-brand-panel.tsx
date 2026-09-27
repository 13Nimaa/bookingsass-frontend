"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, TrendingUp, Users } from "lucide-react";

const APPOINTMENTS = [
  { initial: "ع", name: "علی رضایی", service: "کوت + ریش", time: "۱۰:۳۰", done: true },
  { initial: "س", name: "سارا محمدی", service: "رنگ مو", time: "۱۲:۰۰", done: false },
  { initial: "ا", name: "امیر کریمی", service: "فیشال", time: "۱۴:۰۰", done: false },
] as const;

function RevenueSparkline() {
  return (
    <svg
      viewBox="0 0 200 56"
      fill="none"
      aria-hidden="true"
      className="h-14 w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="auth-spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 44 C 25 40, 35 30, 55 32 S 85 38, 105 26 S 145 12, 165 18 S 190 22, 200 10 L 200 56 L 0 56 Z"
        fill="url(#auth-spark-fill)"
      />
      <path
        d="M0 44 C 25 40, 35 30, 55 32 S 85 38, 105 26 S 145 12, 165 18 S 190 22, 200 10"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="200" cy="10" r="4" fill="#ffffff" />
      <circle cx="200" cy="10" r="7.5" fill="#ffffff" opacity="0.3" />
    </svg>
  );
}

export function AuthBrandPanel() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative hidden overflow-hidden lg:block">
      {/* Base gradient — primary pressed → primary → premium */}
      <div className="absolute inset-0 bg-gradient-to-bl from-[#3730A3] via-[#4F46E5] to-[#5B21B6]" />

      {/* Soft orbs */}
      <div
        aria-hidden="true"
        className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#A5B4FC]/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-1/4 -right-28 h-[28rem] w-[28rem] rounded-full bg-[#C4B5FD]/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute top-1/3 left-1/3 h-56 w-56 rounded-full bg-white/10 blur-3xl"
      />

      {/* Dot texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.16) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(ellipse 90% 70% at 50% 30%, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 70% at 50% 30%, black 30%, transparent 75%)",
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col p-12 xl:p-16">
        {/* Floating glass dashboard card */}
        <div className="flex flex-1 items-center justify-center">
          <motion.div
            animate={reduceMotion ? undefined : { y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-full max-w-sm"
          >
            {/* Depth card */}
            <div
              aria-hidden="true"
              className="absolute inset-0 translate-x-4 translate-y-4 -rotate-3 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md"
            />

            <div className="relative rounded-3xl border border-white/15 bg-white/10 p-5 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              {/* Card header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                    <CalendarDays className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      نوبت‌های امروز
                    </p>
                    <p className="text-[11px] text-white/60">
                      شنبه، ۴ مهر
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-emerald-300 motion-reduce:animate-none" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  </span>
                  زنده
                </span>
              </div>

              {/* Appointments */}
              <ul className="mt-4 space-y-2">
                {APPOINTMENTS.map((a) => (
                  <li
                    key={a.name}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-2.5"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold text-white"
                    >
                      {a.initial}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-white">
                        {a.name}
                      </span>
                      <span className="block text-[11px] text-white/60">
                        {a.service}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-lg bg-white/15 px-2 py-1 text-[11px] font-medium text-white tabular-nums">
                      {a.time}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Revenue */}
              <div className="mt-4 rounded-2xl border border-white/10 bg-[#1E1B4B]/30 px-4 pt-3 pb-1">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-white/60">درآمد این هفته</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-200">
                    <TrendingUp className="h-3 w-3" />
                    ‎+۱۸٪
                  </span>
                </div>
                <p className="mt-1 text-lg font-bold text-white tabular-nums">
                  ۱۲٬۴۰۰٬۰۰۰ <span className="text-[11px] font-normal text-white/60">تومان</span>
                </p>
                <RevenueSparkline />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Copy */}
        <div className="max-w-lg text-white">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur-md">
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
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
              <Users className="mb-2 h-4 w-4 text-white/80" />

              <p className="text-xs text-white/70">مدیریت مشتریان</p>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
              <CalendarDays className="mb-2 h-4 w-4 text-white/80" />

              <p className="text-xs text-white/70">رزرو و نوبت‌دهی</p>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
              <TrendingUp className="mb-2 h-4 w-4 text-white/80" />

              <p className="text-xs text-white/70">گزارش عملکرد</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
