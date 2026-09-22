"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { DashboardMockup } from "./DashboardMockup";
import {
  REVEAL_VIEWPORT,
  createContainerVariants,
  createHeadlineVariants,
  createItemVariants,
} from "./motion";

export function ProductShowcase() {
  const reduceMotion = useReducedMotion();

  const containerVariants = createContainerVariants(0.07);
  const itemVariants = createItemVariants(reduceMotion);
  const headlineVariants = createHeadlineVariants(reduceMotion);

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
    <section id="product" aria-labelledby="product-heading" className="w-full">
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
              همه‌چیز در یکجا
            </span>
          </motion.div>

          <motion.h2
            id="product-heading"
            variants={headlineVariants}
            className="mt-5 text-[28px] font-bold leading-[1.5] text-text-primary sm:text-[36px] sm:leading-[1.45] lg:text-[40px]"
          >
            یک پنل برای مدیریت کامل آرایشگاه
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="mt-3 max-w-[560px] text-[15px] leading-8 text-text-secondary sm:mt-4 sm:text-base"
          >
            نوبت‌ها، مشتریان، خدمات، کارکنان و درآمد آرایشگاه را از یک پنل
            ساده و یکپارچه مدیریت کنید.
          </motion.p>
        </motion.div>

        <motion.div
          variants={visualVariants}
          initial="hidden"
          whileInView="visible"
          viewport={REVEAL_VIEWPORT}
          className="mx-auto mt-10 max-w-6xl sm:mt-14 lg:mt-16"
        >
          <DashboardMockup />
        </motion.div>
      </div>
    </section>
  );
}
