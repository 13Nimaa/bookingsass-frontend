"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/store/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.assign("/login");
    }
  }, [status]);

  if (status !== "authenticated") {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm animate-pulse motion-reduce:animate-none space-y-4">
          <div className="h-8 w-1/3 rounded bg-surface-elevated" />
          <div className="h-24 rounded bg-surface-elevated" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
