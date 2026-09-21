"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h2 className="text-xl font-semibold text-foreground">مشکلی پیش آمد</h2>
      <p className="text-sm text-muted">
        خطای غیرمنتظره‌ای رخ داد. لطفاً دوباره تلاش کنید.
      </p>
      <button
        onClick={reset}
        className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover"
      >
        تلاش دوباره
      </button>
    </main>
  );
}
