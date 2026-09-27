"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { initTokenTimer } from "@/lib/auth/token-timer";

export function SessionInitializer() {
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    initTokenTimer();
    restoreSession();
  }, [restoreSession]);

  return null;
}
