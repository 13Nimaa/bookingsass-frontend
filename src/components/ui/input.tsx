import * as React from "react";
import { cn } from "cn";

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  /** Shows a required asterisk next to the label. */
  requiredMark?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      requiredMark,
      startIcon,
      endIcon,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    return (
      <div className="w-full space-y-2" dir="rtl">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-bold text-text-primary"
          >
            {label}
            {requiredMark && (
              <span className="ms-1 text-[var(--error)]" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="group relative">
          {startIcon && (
            <span
              className="
                absolute right-3.5 top-1/2
                -translate-y-1/2
                text-[var(--muted)]
                transition-colors duration-150
                group-focus-within:text-[var(--primary)]
              "
            >
              {startIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              `
              h-12 w-full
              rounded-xl
              border border-[var(--border)]
              bg-[var(--surface)]
              px-4

              text-[15px]
              font-medium
              text-[var(--text-primary)]
              outline-none

              placeholder:text-[var(--text-disabled)]

              transition-all duration-150

              hover:border-[var(--border-strong)]

              focus:border-[var(--primary)]
              focus:ring-2
              focus:ring-[color-mix(in_srgb,var(--primary)_15%,transparent)]

              disabled:cursor-not-allowed
              disabled:bg-[var(--surface-secondary)]
              disabled:text-[var(--text-disabled)]
              disabled:opacity-60
              `,
              startIcon && "pr-12",
              endIcon && "pl-11",
              error &&
                `
                border-[var(--error)]
                focus:border-[var(--error)]
                focus:ring-[var(--error-soft)]
                `,
              className
            )}
            {...props}
          />

          {endIcon && (
            <span
              className="
                absolute left-3 top-1/2
                -translate-y-1/2
                text-[var(--muted)]
                transition-colors duration-150
                group-focus-within:text-[var(--primary)]
              "
            >
              {endIcon}
            </span>
          )}
        </div>

        {error ? (
          <p className="text-[13px] leading-5 font-bold text-[var(--error-text)]">
            {error}
          </p>
        ) : hint ? (
          <p className="text-[13px] leading-5 font-medium text-muted">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };