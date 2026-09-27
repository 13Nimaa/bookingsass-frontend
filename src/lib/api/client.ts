import { BACKEND_BASE_URL } from "@/lib/api/http";
import { useAuthStore } from "@/features/auth/store/auth-store";

// Authenticated backend transport. Attaches the in-memory access token and,
// on 401, retries once after a single-flight token refresh.
//
// Shared module (no "use client"): only declarations at module scope, so
// Server Components can transitively import it. `window` is touched solely
// in the dead-session branch, which only client-side callers can reach.
export async function apiClient(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const attachToken = (): RequestInit => {
    const token = useAuthStore.getState().accessToken;
    const headers = new Headers(options.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return { ...options, headers, credentials: "include" };
  };

  let res = await fetch(`${BACKEND_BASE_URL}${path}`, attachToken());

  if (res.status === 401) {
    // Single-flight dedupe lives in the store — concurrent 401s share one refresh.
    const ok = await useAuthStore.getState().refresh();
    if (ok) {
      res = await fetch(`${BACKEND_BASE_URL}${path}`, attachToken());
    } else if (useAuthStore.getState().status === "unauthenticated") {
      // Session is truly gone (not just rate-limited) — go to login.
      window.location.assign("/login");
    }
  }

  return res;
}
