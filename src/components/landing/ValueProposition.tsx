"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { CalendarDays, TrendingUp, Users } from "lucide-react";
import { ProblemCard } from "./ProblemCard";
import {
  EASE,
  REVEAL_VIEWPORT,
  createContainerVariants,
  createHeadlineVariants,
  createItemVariants,
} from "./motion";

const PROBLEMS = [
  {
    title: "اطلاعات مشتریان پراکنده است",
    description:
      "اطلاعات تماس، سابقه مراجعه و خدمات مشتریان را یکجا نگه دارید و همیشه به آن‌ها دسترسی داشته باشید.",
    icon: Users,
  },
  {
    title: "مدیریت نوبت‌ها زمان‌بر است",
    description:
      "نوبت‌ها را در یک تقویم منظم مدیریت کنید و دید کاملی از برنامه روزانه آرایشگاه داشته باشید.",
    icon: CalendarDays,
  },
  {
    title: "تصویر دقیقی از عملکرد ندارید",
    description:
      "درآمد، مشتریان و خدمات را بررسی کنید و عملکرد آرایشگاه را بر اساس داده ببینید.",
    icon: TrendingUp,
  },
];

const FEATURE_LABELS = [
  "مشتریان",
  "نوبت‌ها",
  "خدمات",
  "کارکنان",
  "پرداخت‌ها",
  "گزارش‌ها",
];

export function ValueProposition() {
  const reduceMotion = useReducedMotion();

  const containerVariants = createContainerVariants(0.07);
  const itemVariants = createItemVariants(reduceMotion);
  const headlineVariants = createHeadlineVariants(reduceMotion);

  const dividerVariants: Variants = {
    hidden: { opacity: 0, scaleX: 0 },
    visible: {
      opacity: 1,
      scaleX: 1,
      transition: {
        duration: reduceMotion ? 0 : 0.5,
        ease: EASE,
      },
    },
  };

  return (
    <section
      id="features"
      aria-labelledby="value-prop-heading"
      className="w-full"
    >
      <div className="mx-auto w-full max-w-[1240px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={REVEAL_VIEWPORT}
          className="mx-auto flex max-w-2xl flex-col items-center text-center"
        >
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-subtle bg-primary-soft px-3.5 py-1.5 text-[13px] font-medium text-primary">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-primary"
              />
              چرا BarberCRM؟
            </span>
          </motion.div>

          <motion.h2
            id="value-prop-heading"
            variants={headlineVariants}
            className="mt-5 text-[28px] font-bold leading-[1.5] text-text-primary sm:text-[36px] sm:leading-[1.45] lg:text-[40px]"
          >
            مدیریت آرایشگاه نباید پیچیده باشد.
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="mt-3 max-w-[560px] text-[15px] leading-8 text-text-secondary sm:mt-4 sm:text-base"
          >
            همه ابزارهایی که برای مدیریت روزانه آرایشگاه نیاز دارید، در یک
            سیستم یکپارچه و ساده.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={REVEAL_VIEWPORT}
          className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6"
        >
          {PROBLEMS.map((problem) => (
            <motion.div key={problem.title} variants={itemVariants}>
              <ProblemCard {...problem} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={REVEAL_VIEWPORT}
          className="mx-auto mt-12 flex max-w-2xl flex-col items-center text-center sm:mt-16"
        >
          <motion.span
            variants={dividerVariants}
            aria-hidden="true"
            className="mb-6 block h-px w-12 bg-border sm:mb-8"
          />

          <motion.p
            variants={itemVariants}
            className="text-lg font-semibold leading-9 text-text-primary sm:text-xl"
          >
            همه این‌ها را از یکجا مدیریت کنید.
          </motion.p>

          <motion.p
            variants={itemVariants}
            className="mt-2 max-w-xl text-sm leading-7 text-text-secondary sm:text-[15px]"
          >
            BarberCRM ابزارهای اصلی مدیریت آرایشگاه را در یک تجربه ساده و
            یکپارچه کنار هم قرار می‌دهد.
          </motion.p>

          <motion.ul
            variants={itemVariants}
            aria-label="بخش‌های اصلی BarberCRM"
            className="mt-6 flex flex-wrap items-center justify-center gap-2"
          >
            {FEATURE_LABELS.map((label) => (
              <li
                key={label}
                className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs leading-5 text-muted sm:text-[13px]"
              >
                {label}
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  );
}
