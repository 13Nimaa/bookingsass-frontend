import * as React from "react";
import { cn } from "cn";

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
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
      startIcon,
      endIcon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? React.useId();

    return (
      <div className="w-full space-y-2" dir="rtl">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--text-primary)]"
          >
            {label}
          </label>
        )}

        <div className="group relative">
          {startIcon && (
            <span
              className="
                pointer-events-none
                absolute right-3 top-1/2
                -translate-y-1/2
                text-[var(--muted)]
                transition-colors duration-200
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

              text-sm
              text-[var(--text-primary)]
              outline-none

              placeholder:text-[var(--text-disabled)]

              transition-all duration-200

              hover:border-[var(--border-strong)]

              focus:border-[var(--primary)]
              focus:ring-4
              focus:ring-[var(--primary-soft)]

              disabled:cursor-not-allowed
              disabled:bg-[var(--surface-secondary)]
              disabled:text-[var(--text-disabled)]
              disabled:opacity-60
              `,
              startIcon && "pr-11",
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
                pointer-events-none
                absolute left-3 top-1/2
                -translate-y-1/2
                text-[var(--muted)]
                transition-colors duration-200
                group-focus-within:text-[var(--primary)]
              "
            >
              {endIcon}
            </span>
          )}
        </div>

        {error ? (
          <p className="text-xs font-medium text-[var(--error-text)]">
            {error}
          </p>
        ) : hint ? (
          <p className="text-xs text-[var(--muted)]">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };