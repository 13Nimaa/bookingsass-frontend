"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  loadingText?: string;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover focus-visible:outline-primary",
  secondary:
    "bg-surface-elevated text-foreground border border-border hover:bg-surface",
  ghost: "bg-transparent text-foreground hover:bg-surface-elevated",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", loading = false, loadingText, children, className = "", disabled, ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        className={`inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none ${VARIANTS[variant]} ${className}`}
        {...props}
      >
        {loading && <Loader2 size={16} className="animate-spin motion-reduce:animate-none" />}
        {loading && loadingText ? loadingText : children}
      </button>
    );
  }
);
