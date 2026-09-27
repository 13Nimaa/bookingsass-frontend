"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { Check } from "lucide-react";
import { DashboardPreview } from "./DashboardPreview";
import {
  REVEAL_VIEWPORT,
  createContainerVariants,
  createHeadlineVariants,
  createItemVariants,
} from "./motion";

const TRUST_ITEMS = [
  "بدون نیاز به نصب",
  "راه‌اندازی سریع",
  "مناسب آرایشگاه‌های مردانه",
];

export function Hero() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const glowY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 60]);

  const containerVariants = createContainerVariants(0.08);
  const itemVariants = createItemVariants(reduceMotion ?? false);
  const headlineVariants = createHeadlineVariants(reduceMotion ?? false);

  const visualVariants: Variants = {
    hidden: {
      opacity: 0,
      y: reduceMotion ? 0 : 36,
      scale: reduceMotion ? 1 : 0.975,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: reduceMotion ? 0 : 0.65,
        ease: [0.22, 1, 0.36, 1],
        delay: reduceMotion ? 0 : 0.15,
      },
    },
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-heading"
      className="w-full"
    >
      <div className="mx-auto w-full max-w-[1320px] px-4 pb-20 pt-12 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8 lg:pb-28 lg:pt-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={REVEAL_VIEWPORT}
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-subtle bg-primary-soft px-3.5 py-1.5 text-[13px] font-medium text-primary">
              <motion.span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-primary"
                animate={
                  reduceMotion
                    ? undefined
                    : { scale: [1, 1.4, 1], opacity: [1, 0.55, 1] }
                }
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              مدیریت هوشمند آرایشگاه
            </span>
          </motion.div>

          <h1
            id="hero-heading"
            className="mt-5 text-[36px] font-bold leading-[1.35] text-text-primary sm:mt-6 sm:text-[44px] md:text-[48px] lg:text-[56px] lg:leading-[1.28] xl:text-[64px]"
          >
            <motion.span variants={headlineVariants} className="block">
              آرایشگاهتان را ساده‌تر،
            </motion.span>
            <motion.span variants={headlineVariants} className="block">
              حرفه‌ای‌تر مدیریت کنید.
            </motion.span>
          </h1>

          <motion.p
            variants={itemVariants}
            className="mt-4 max-w-[640px] text-base leading-8 text-text-secondary sm:mt-5 sm:text-lg"
          >
            مشتری‌ها، نوبت‌ها، خدمات، کارکنان و درآمد را از یک پنل مدرن و
            یکپارچه مدیریت کنید.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-7 flex w-full flex-col gap-3 sm:mt-8 sm:w-auto sm:flex-row"
          >
            <Link
              href="/register"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-white shadow-sm transition duration-150 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md active:translate-y-0 active:bg-primary-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:hover:translate-y-0 sm:w-auto"
            >
              شروع رایگان
            </Link>
            <Link
              href="/#features"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-border bg-surface px-6 text-sm font-medium text-text-primary transition duration-150 hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-hover hover:shadow-sm active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:hover:translate-y-0 sm:w-auto"
            >
              مشاهده امکانات
            </Link>
          </motion.div>

          <motion.ul
            variants={itemVariants}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 sm:mt-7"
          >
            {TRUST_ITEMS.map((item) => (
              <li
                key={item}
                className="flex items-center gap-1.5 text-[13px] leading-5 text-muted"
              >
                <Check
                  aria-hidden="true"
                  className="h-3.5 w-3.5 shrink-0 text-primary"
                  strokeWidth={2.5}
                />
                {item}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          variants={visualVariants}
          initial="hidden"
          whileInView="visible"
          viewport={REVEAL_VIEWPORT}
          className="relative mx-auto mt-12 max-w-[1240px] sm:mt-16 lg:mt-24"
        >
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-4 -top-12 bottom-4 -z-10 rounded-[32px] blur-3xl"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(79,70,229,0.18), transparent 70%)",
              y: glowY,
            }}
          />
          <DashboardPreview />
        </motion.div>
      </div>
    </section>
  );
}
