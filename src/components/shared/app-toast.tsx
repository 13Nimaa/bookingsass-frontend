"use client";

import { useEffect } from "react";
import { AlertCircle, Check, X } from "lucide-react";
import { cn } from "cn";

export type ToastTone = "success" | "error";

interface AppToastProps {
  message: string | null;
  tone?: ToastTone;
  onDismiss: () => void;
  durationMs?: number;
}

/**
 * Lightweight fixed toast — no extra library. Auto-dismisses; Esc/dismiss clears.
 */
export function AppToast({
  message,
  tone = "success",
  onDismiss,
  durationMs = 4000,
}: AppToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [message, durationMs, onDismiss]);

  if (!message) return null;

  const isSuccess = tone === "success";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-auto fixed inset-x-4 bottom-20 z-[60] mx-auto flex max-w-md items-start gap-3 rounded-2xl border px-4 py-3 shadow-[0_20px_40px_-24px_rgba(30,27,75,0.45)] transition-opacity duration-200 motion-reduce:transition-none md:inset-x-auto md:end-6 md:bottom-6 md:mx-0",
        isSuccess
          ? "border-success-border bg-success-soft text-success-text"
          : "border-error-border bg-error-soft text-error-text"
      )}
    >
      {isSuccess ? (
        <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      <p className="min-w-0 flex-1 text-[13px] leading-5 font-bold">{message}</p>
      <button
        type="button"
        aria-label="بستن اعلان"
        onClick={onDismiss}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
