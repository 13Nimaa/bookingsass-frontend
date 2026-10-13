"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "cn";

interface BackButtonProps {
  /** Fallback destination when history is empty (e.g. direct link). */
  fallbackHref?: string;
  label?: string;
  className?: string;
}

/**
 * Shared dashboard back control.
 * RTL-aware: back arrow points right. Uses router.back() with fallback.
 * Isolated leaf Client Component — safe to drop into any Server page.
 */
export function BackButton({ fallbackHref = "/dashboard", label = "بازگشت", className }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // window.history.length <= 1 means direct entry — push fallback instead.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleBack}
      aria-label={label}
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={cn(
        "group inline-flex h-9 items-center gap-2 rounded-full",
        "border border-border bg-surface pr-2.5 pl-4",
        "text-[13px] font-semibold text-text-secondary",
        "shadow-[0_1px_2px_rgba(17,24,39,0.06)]",
        "transition-colors duration-200",
        "hover:border-border-strong hover:bg-surface-hover hover:text-foreground",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        "active:translate-y-px",
        className
      )}
    >
      <ArrowRight
        className="h-4 w-4 text-muted transition-transform duration-200 group-hover:-translate-x-0.5 group-hover:text-foreground"
        aria-hidden="true"
      />
      {label}
    </motion.button>
  );
}
