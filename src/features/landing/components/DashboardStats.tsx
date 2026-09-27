import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  CalendarDays,
  Check,
  ClipboardList,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { REVEAL_VIEWPORT, EASE } from "./motion";

type TrendTone = "success" | "info";

interface DashboardStat {
  label: string;
  value: string;
  unit?: string;
  trend: string;
  icon: LucideIcon;
  tone: TrendTone;
  showOnMobile?: boolean;
}

const STATS: DashboardStat[] = [
  {
    label: "نوبت‌های امروز",
    value: "۱۸",
    trend: "۳ بیشتر از دیروز",
    icon: CalendarDays,
    tone: "success",
    showOnMobile: true,
  },
  {
    label: "مشتریان",
    value: "۳۲۴",
    trend: "+۱۲ این ماه",
    icon: Users,
    tone: "success",
    showOnMobile: true,
  },
  {
    label: "درآمد این ماه",
    value: "۴۸,۵۰۰,۰۰۰",
    unit: "تومان",
    trend: "+۸٪ نسبت به ماه قبل",
    icon: Wallet,
    tone: "success",
  },
  {
    label: "خدمات انجام‌شده",
    value: "۱۸۶",
    trend: "۹۲٪ تکمیل‌شده",
    icon: ClipboardList,
    tone: "info",
  },
];

const TONE_CLASSES: Record<TrendTone, string> = {
  success: "text-success-text",
  info: "text-info-text",
};

function StatCard({
  label,
  value,
  unit,
  trend,
  icon: Icon,
  tone,
  showOnMobile,
}: DashboardStat) {
  const TrendIcon = tone === "success" ? TrendingUp : Check;

  return (
    <div
      className={`h-full rounded-xl border border-border bg-surface p-3 shadow-sm sm:p-4 ${
        showOnMobile ? "" : "max-sm:hidden"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 truncate text-[11px] font-medium leading-5 text-muted sm:text-xs">
          {label}
        </p>
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-primary-soft text-primary lg:h-9 lg:w-9"
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>
      <p className="mt-1.5 whitespace-nowrap text-[17px] font-semibold leading-7 tracking-tight text-text-primary tabular-nums sm:text-lg lg:text-xl">
        {value}
        {unit && (
          <span className="ms-1 text-[11px] font-normal text-muted">
            {unit}
          </span>
        )}
      </p>
      <p
        className={`mt-1 inline-flex items-center gap-1 text-[11px] font-medium leading-4 ${TONE_CLASSES[tone]}`}
      >
        <TrendIcon
          aria-hidden="true"
          className="h-3 w-3 shrink-0"
          strokeWidth={2.5}
        />
        {trend}
      </p>
    </div>
  );
}

export function DashboardStats() {
  const reduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: reduceMotion
        ? { duration: 0 }
        : { staggerChildren: 0.05 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0 : 0.45,
        ease: EASE,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={REVEAL_VIEWPORT}
      className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4"
    >
      {STATS.map((stat) => (
        <motion.div key={stat.label} variants={itemVariants} className="h-full">
          <StatCard {...stat} />
        </motion.div>
      ))}
    </motion.div>
  );
}
