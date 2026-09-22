"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "cn";
import {
  REVEAL_VIEWPORT,
  createContainerVariants,
  createHeadlineVariants,
  createItemVariants,
} from "./motion";

interface PricingPlan {
  name: string;
  description: string;
  price: string;
  period?: string;
  features: string[];
  cta: string;
  href: string;
  featured: boolean;
}

const PRICING_PLANS: PricingPlan[] = [
  {
    name: "پایه",
    description: "مناسب آرایشگاه‌های کوچک و تازه‌کار",
    price: "رایگان",
    features: [
      "مدیریت مشتریان",
      "مدیریت نوبت‌ها",
      "مدیریت خدمات",
      "پروفایل آرایشگاه",
      "تقویم کاری",
    ],
    cta: "شروع رایگان",
    href: "/register",
    featured: false,
  },
  {
    name: "حرفه‌ای",
    description: "مناسب آرایشگاه‌های در حال رشد",
    price: "۲۹۹ هزار تومان",
    period: "در ماه",
    features: [
      "همه امکانات پلن پایه",
      "مدیریت کارکنان",
      "گزارش درآمد",
      "سوابق مشتریان",
      "یادآوری نوبت‌ها",
      "گزارش عملکرد",
    ],
    cta: "شروع استفاده",
    href: "/register",
    featured: true,
  },
  {
    name: "کسب‌وکار",
    description: "مناسب تیم‌ها و آرایشگاه‌های بزرگ",
    price: "۵۹۹ هزار تومان",
    period: "در ماه",
    features: [
      "همه امکانات پلن حرفه‌ای",
      "مدیریت چند کاربر",
      "گزارش‌های پیشرفته",
      "مدیریت تیم",
      "امکانات اختصاصی کسب‌وکار",
      "پشتیبانی ویژه",
    ],
    cta: "شروع استفاده",
    href: "/register",
    featured: false,
  },
];

function PricingCard({ plan }: { plan: PricingPlan }) {
  const { name, description, price, period, features, cta, href, featured } =
    plan;

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col rounded-xl border p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0 motion-reduce:transition-none sm:p-6",
        featured
          ? "border-premium-border bg-premium-soft"
          : "border-border bg-surface hover:border-border-strong"
      )}
    >
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-premium-border bg-surface px-3 py-1 text-xs font-medium text-premium shadow-sm">
          پیشنهاد محبوب
        </span>
      )}

      <h3 className="text-base font-semibold leading-7 text-text-primary">
        {name}
      </h3>
      <p className="mt-1 text-sm leading-6 text-muted">{description}</p>

      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="text-[26px] font-bold leading-9 text-text-primary sm:text-[30px]">
          {price}
        </span>
        {period ? (
          <span className="text-sm font-normal text-muted">{period}</span>
        ) : null}
      </div>

      <ul className="mt-5 mb-6 space-y-2.5">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-sm leading-6 text-text-secondary"
          >
            <Check
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0 text-primary"
              strokeWidth={2.5}
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={href}
        aria-label={`${cta} - پلن ${name}`}
        className={cn(
          "mt-auto inline-flex h-12 w-full items-center justify-center rounded-xl px-6 text-sm font-medium transition duration-150 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:hover:translate-y-0",
          featured
            ? "bg-primary text-white shadow-sm hover:bg-primary-hover hover:shadow-md active:bg-primary-pressed"
            : "border border-border bg-surface text-text-primary hover:border-border-strong hover:bg-surface-hover hover:shadow-sm"
        )}
      >
        {cta}
      </Link>
    </div>
  );
}

export function Pricing() {
  const reduceMotionPref = useReducedMotion();
  const reduceMotion = reduceMotionPref ?? false;

  const containerVariants = createContainerVariants(0.08);
  const itemVariants = createItemVariants(reduceMotion);
  const headlineVariants = createHeadlineVariants(reduceMotion);

  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="w-full">
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
              قیمت‌گذاری شفاف
            </span>
          </motion.div>

          <motion.h2
            id="pricing-heading"
            variants={headlineVariants}
            className="mt-5 text-[28px] font-bold leading-[1.5] text-text-primary sm:text-[36px] sm:leading-[1.45] lg:text-[40px]"
          >
            پلنی متناسب با نیاز آرایشگاه شما
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="mt-3 max-w-[560px] text-[15px] leading-8 text-text-secondary sm:mt-4 sm:text-base"
          >
            بدون هزینه‌های پنهان؛ امکانات موردنیازتان را انتخاب کنید و مدیریت
            آرایشگاه را ساده‌تر کنید.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={REVEAL_VIEWPORT}
          className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-6"
        >
          {PRICING_PLANS.map((plan) => (
            <motion.div key={plan.name} variants={itemVariants}>
              <PricingCard plan={plan} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
