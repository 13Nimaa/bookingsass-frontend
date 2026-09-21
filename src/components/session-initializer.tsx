"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { initTokenTimer } from "@/lib/token-timer";

export function SessionInitializer() {
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    initTokenTimer();
    restoreSession();
  }, [restoreSession]);

  return null;
}
