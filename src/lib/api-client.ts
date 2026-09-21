"use client";

import { useAuthStore } from "@/store/auth-store";

export async function apiClient(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const attachToken = (): RequestInit => {
    const token = useAuthStore.getState().accessToken;
    const headers = new Headers(options.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return { ...options, headers };
  };

  let res = await fetch(path, attachToken());

  if (res.status === 401) {
    // Single-flight dedupe lives in the store — concurrent 401s share one refresh.
    const ok = await useAuthStore.getState().refresh();
    if (ok) {
      res = await fetch(path, attachToken());
    } else if (useAuthStore.getState().status === "unauthenticated") {
      // Session is truly gone (not just rate-limited) — go to login.
      window.location.assign("/login");
    }
  }

  return res;
}
