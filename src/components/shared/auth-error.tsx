import { forwardRef } from "react";
import { AlertCircle } from "lucide-react";

export const AuthError = forwardRef<HTMLDivElement, { message: string }>(
  function AuthError({ message }, ref) {
    return (
      <div
        ref={ref}
        role="alert"
        tabIndex={-1}
        className="flex items-start gap-2.5 rounded-2xl border border-error-border bg-error-soft px-4 py-3.5 text-sm leading-6 font-semibold text-error-text shadow-[0_1px_2px_rgba(220,38,38,0.08)] focus:outline-none"
      >
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
        <span>{message}</span>
      </div>
    );
  }
);
