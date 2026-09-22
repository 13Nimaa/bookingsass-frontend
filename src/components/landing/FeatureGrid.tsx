"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, ChartColumn, UserRound, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  REVEAL_VIEWPORT,
  createContainerVariants,
  createHeadlineVariants,
  createItemVariants,
} from "./motion";

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
}

const FEATURES: Feature[] = [
  {
    title: "مدیریت نوبت‌ها",
    description:
      "برنامه نوبت‌ها را مرتب کنید، زمان‌های خالی را ببینید و رزروها را بدون دردسر مدیریت کنید.",
    icon: CalendarDays,
  },
  {
    title: "مدیریت مشتریان",
    description:
      "اطلاعات مشتریان، سابقه خدمات و تعاملات آن‌ها را همیشه در دسترس داشته باشید.",
    icon: Users,
  },
  {
    title: "درآمد و گزارش‌ها",
    description:
      "درآمد، خدمات و عملکرد آرایشگاه را با گزارش‌های ساده و قابل‌فهم بررسی کنید.",
    icon: ChartColumn,
  },
  {
    title: "مدیریت کارکنان",
    description:
      "کارکنان، خدمات، برنامه کاری و عملکرد اعضای تیم را از یک پنل مدیریت کنید.",
    icon: UserRound,
  },
];

function FeatureCard({ title, description, icon: Icon }: Feature) {
  return (
    <div className="group h-full rounded-xl border border-border bg-surface p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-border-strong hover:shadow-md motion-reduce:hover:translate-y-0 motion-reduce:transition-none sm:p-6">
      <span
        aria-hidden="true"
        className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-primary-soft text-primary transition-transform duration-200 group-hover:scale-110 motion-reduce:group-hover:scale-100"
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </span>
      <h3 className="mt-4 text-base font-semibold leading-7 text-text-primary">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-7 text-text-secondary">{description}</p>
    </div>
  );
}

export function FeatureGrid() {
  const reduceMotion = useReducedMotion();

  const containerVariants = createContainerVariants(0.08);
  const itemVariants = createItemVariants(reduceMotion);
  const headlineVariants = createHeadlineVariants(reduceMotion);

  return (
    <section
      id="capabilities"
      aria-labelledby="capabilities-heading"
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
          <motion.h2
            id="capabilities-heading"
            variants={headlineVariants}
            className="text-[28px] font-bold leading-[1.5] text-text-primary sm:text-[36px] sm:leading-[1.45] lg:text-[40px]"
          >
            همه‌چیز برای مدیریت حرفه‌ای آرایشگاه
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="mt-3 max-w-[560px] text-[15px] leading-8 text-text-secondary sm:mt-4 sm:text-base"
          >
            از نوبت‌دهی تا مدیریت مشتری و درآمد، همه ابزارهای موردنیاز
            آرایشگاه در یک پنل.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={REVEAL_VIEWPORT}
          className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:gap-5 md:grid-cols-2 lg:gap-6"
        >
          {FEATURES.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
