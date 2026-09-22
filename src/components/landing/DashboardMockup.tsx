"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { CalendarDays, ChevronDown, Lock } from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardStats } from "./DashboardStats";
import { AppointmentList } from "./AppointmentList";
import { RevenueChart } from "./RevenueChart";
import { REVEAL_VIEWPORT, EASE } from "./motion";

export function DashboardMockup() {
  const reduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: reduceMotion
        ? { duration: 0 }
        : { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0 : 0.5,
        ease: EASE,
      },
    },
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(17,24,39,0.04),0_24px_48px_-24px_rgba(17,24,39,0.10)]">
      <div
        aria-hidden="true"
        className="flex items-center gap-2 border-b border-border bg-surface-secondary px-3 py-2.5 sm:px-4"
      >
        <span className="flex shrink-0 gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
        </span>
        <div className="flex flex-1 justify-center">
          <span
            dir="ltr"
            className="inline-flex max-w-full items-center gap-1.5 truncate rounded-md border border-border bg-surface px-2.5 py-1 text-[10px] leading-4 text-muted sm:text-[11px]"
          >
            <Lock className="h-3 w-3 shrink-0" strokeWidth={2} />
            app.barbercrm.ir
          </span>
        </div>
        <span className="hidden w-[46px] shrink-0 sm:block" />
      </div>

      <DashboardSidebar variant="top" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={REVEAL_VIEWPORT}
        className="flex bg-background"
      >
        <DashboardSidebar variant="aside" />

        <div className="min-w-0 flex-1 p-3 sm:p-4 lg:p-5">
          <motion.div
            variants={itemVariants}
            className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:mb-4 sm:gap-3"
          >
            <div className="min-w-0">
              <p className="text-[13px] font-semibold leading-5 text-text-primary sm:text-sm">
                خوش آمدید 👋
              </p>
              <p className="text-[11px] leading-4 text-muted">
                این خلاصه‌ای از وضعیت آرایشگاه شماست.
              </p>
            </div>

            <span
              aria-hidden="true"
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-[11px] leading-4 text-text-secondary lg:h-9"
            >
              <CalendarDays className="h-3.5 w-3.5 text-muted" strokeWidth={2} />
              شهریور ۱۴۰۴
              <ChevronDown className="h-3.5 w-3.5 text-muted" strokeWidth={2} />
            </span>
          </motion.div>

          <DashboardStats />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={REVEAL_VIEWPORT}
            className="mt-2 grid gap-2 sm:mt-3 sm:gap-3 md:grid-cols-2 lg:grid-cols-5"
          >
            <motion.div variants={itemVariants} className="lg:col-span-3">
              <AppointmentList />
            </motion.div>
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <RevenueChart />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
