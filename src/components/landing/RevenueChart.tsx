"use client";

import { motion, useReducedMotion } from "framer-motion";
import { REVEAL_VIEWPORT, EASE } from "./motion";

const CHART_DATA: { day: string; height: number; highlight?: boolean }[] = [
  { day: "ش", height: 42 },
  { day: "ی", height: 55 },
  { day: "د", height: 48 },
  { day: "س", height: 66 },
  { day: "چ", height: 60 },
  { day: "پ", height: 88, highlight: true },
  { day: "ج", height: 74 },
];

const GRID_LINES = [0, 1, 2, 3];

export function RevenueChart() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-surface p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-[13px] font-semibold leading-5 text-text-primary sm:text-sm">
          درآمد هفتگی
        </h3>
        <span className="shrink-0 rounded-full border border-success-border bg-success-soft px-2 py-0.5 text-[10px] font-medium leading-4 text-success-text sm:text-[11px]">
          +۱۲٪
        </span>
      </div>

      <div
        aria-hidden="true"
        className="relative flex h-28 items-end gap-1.5 sm:h-36 sm:gap-2 lg:h-40"
      >
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
          {GRID_LINES.map((line) => (
            <span key={line} className="h-px w-full bg-border" />
          ))}
        </div>

        <div className="relative flex w-full items-end gap-1.5 sm:gap-2">
          {CHART_DATA.map((bar, index) => (
            <motion.div
              key={bar.day}
              className={`flex-1 origin-bottom rounded-t-md ${
                bar.highlight ? "bg-primary" : "bg-primary-subtle"
              }`}
              style={{ height: `${bar.height}%` }}
              initial={{ scaleY: reduceMotion ? 1 : 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={REVEAL_VIEWPORT}
              transition={{
                duration: reduceMotion ? 0 : 0.5,
                delay: reduceMotion ? 0 : 0.2 + index * 0.06,
                ease: EASE,
              }}
            />
          ))}
        </div>
      </div>

      <div aria-hidden="true" className="mt-1.5 flex gap-1.5 sm:gap-2">
        {CHART_DATA.map((bar) => (
          <span
            key={bar.day}
            className="flex-1 text-center text-[10px] leading-4 text-muted"
          >
            {bar.day}
          </span>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border pt-2.5 text-[11px] leading-4">
        <span className="text-muted">
          کل هفته:{" "}
          <span className="font-medium text-text-primary tabular-nums">
            ۲۱,۴۰۰,۰۰۰ تومان
          </span>
        </span>
        <span className="text-muted">
          بیشترین:{" "}
          <span className="font-medium text-text-primary">پنجشنبه</span>
        </span>
      </div>
    </div>
  );
}
