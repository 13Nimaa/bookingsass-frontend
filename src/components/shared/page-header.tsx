"use client";

import { motion } from "framer-motion";
import { BackButton } from "@/components/shared/back-button";
import { cn } from "cn";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  /** Hide the back button (e.g. dashboard home). */
  hideBack?: boolean;
  backFallbackHref?: string;
  className?: string;
}

/**
 * Asymmetric dashboard page header (Skill Rule 3: no centered heroes).
 * Start-aligned, eyebrow + dense title + high-contrast description.
 * Staggered waterfall reveal, transform/opacity only.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  hideBack = false,
  backFallbackHref = "/dashboard",
  className,
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn("w-full", className)}
    >
      {!hideBack && (
        <div className="mb-4">
          <BackButton fallbackHref={backFallbackHref} />
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0 max-w-[65ch]">
          {eyebrow && (
            <p className="mb-1.5 flex items-center gap-2 text-[12px] font-bold tracking-wide text-primary">
              <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              {eyebrow}
            </p>
          )}
          <h1 className="text-balance text-[28px] leading-[1.3] font-bold tracking-tight text-[#1e1b4b] sm:text-[32px] sm:leading-[1.25]">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-[65ch] text-sm leading-6 font-medium text-slate-600 sm:text-[15px] sm:leading-7">
              {description}
            </p>
          )}
        </div>

        {actions && <div className="flex shrink-0 items-center gap-2.5">{actions}</div>}
      </div>
    </motion.div>
  );
}
