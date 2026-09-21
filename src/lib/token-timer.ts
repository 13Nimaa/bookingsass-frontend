"use client";

import { useAuthStore } from "@/store/auth-store";

const REFRESH_LEAD_MS = 60_000; // refresh 60s before expiry

let timer: ReturnType<typeof setTimeout> | null = null;

function schedule() {
  if (timer) clearTimeout(timer);
  timer = null;

  const { accessToken, expiresAt, refresh } = useAuthStore.getState();
  if (!accessToken || !expiresAt) return;

  const delay = new Date(expiresAt).getTime() - REFRESH_LEAD_MS - Date.now();
  if (delay <= 0) {
    void refresh();
    return;
  }
  timer = setTimeout(() => {
    void refresh();
  }, delay);
}

// Background tabs throttle setTimeout — reschedule/immediately refresh on focus.
function onVisibility() {
  if (document.visibilityState !== "visible") return;
  const { accessToken, expiresAt, refresh } = useAuthStore.getState();
  if (!accessToken || !expiresAt) return;
  if (new Date(expiresAt).getTime() - Date.now() <= REFRESH_LEAD_MS) {
    void refresh();
  } else {
    schedule();
  }
}

let initialized = false;

export function initTokenTimer() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  // Re-schedule whenever the token changes (login, register, refresh, restore).
  useAuthStore.subscribe((state, prev) => {
    if (state.expiresAt !== prev.expiresAt) schedule();
  });
  document.addEventListener("visibilitychange", onVisibility);
}
