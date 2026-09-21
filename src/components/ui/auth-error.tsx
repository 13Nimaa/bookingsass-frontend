import { forwardRef } from "react";
import { AlertCircle } from "lucide-react";

export const AuthError = forwardRef<HTMLDivElement, { message: string }>(
  function AuthError({ message }, ref) {
    return (
      <div
        ref={ref}
        role="alert"
        tabIndex={-1}
        className="flex items-center gap-2 rounded-md border border-error/30 bg-error/10 px-3 py-2 text-sm text-error focus:outline-none"
      >
        <AlertCircle size={16} className="shrink-0" />
        <span>{message}</span>
      </div>
    );
  }
);
