"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { BackButton } from "@/components/shared/back-button";
import { cn } from "cn";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  /** Optional badge rendered inline next to the title (desktop). */
  badge?: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  /** Hide the back button (e.g. dashboard home). */
  hideBack?: boolean;
  backFallbackHref?: string;
  className?: string;
}

/**
 * Dashboard page header.
 * Mobile: fixed glass bar with back icon + centered title.
 * Desktop: asymmetric eyebrow + title + description + actions.
 */
export function PageHeader({
  eyebrow,
  title,
  badge,
  description,
  actions,
  hideBack = false,
  backFallbackHref = "/dashboard",
  className,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(backFallbackHref);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Mobile glass chrome — fixed, matches MobileTabBar pattern */}
      <div aria-hidden="true" className="h-14 shrink-0 md:hidden" />
      <header
        className="fixed inset-x-0 top-0 z-30 border-b border-border/60 bg-surface/75 pt-[env(safe-area-inset-top)] backdrop-blur-xl md:hidden"
      >
        <div className="relative flex h-14 items-center justify-center px-14">
          {!hideBack && (
            <button
              type="button"
              onClick={handleBack}
              aria-label="بازگشت"
              className="absolute start-2 flex h-10 w-10 items-center justify-center rounded-xl text-text-primary transition-colors hover:bg-surface-secondary active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
          <h1 className="truncate text-center text-[17px] font-extrabold tracking-tight text-text-primary">
            {title}
          </h1>
        </div>
      </header>

      {/* Mobile: description + actions under the glass bar */}
      {(description || actions) && (
        <div className="mb-4 flex flex-col gap-3 md:hidden">
          {description && (
            <p className="text-sm leading-6 font-medium text-slate-600">{description}</p>
          )}
          {actions && <div className="flex shrink-0 items-center gap-2.5">{actions}</div>}
        </div>
      )}

      {/* Desktop header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="hidden w-full md:block"
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
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-balance text-[28px] leading-[1.3] font-bold tracking-tight text-[#1e1b4b] sm:text-[32px] sm:leading-[1.25]">
                {title}
              </h1>
              {badge}
            </div>
            {description && (
              <p className="mt-2 max-w-[65ch] text-sm leading-6 font-medium text-slate-600 sm:text-[15px] sm:leading-7">
                {description}
              </p>
            )}
          </div>

          {actions && <div className="flex shrink-0 items-center gap-2.5">{actions}</div>}
        </div>
      </motion.div>
    </div>
  );
}
