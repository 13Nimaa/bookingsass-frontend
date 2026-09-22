import { create } from "zustand";
import type { User, AuthStatus, ClientAuthResponse } from "@/types/auth";

// Single-flight guard: api-client (reactive 401) and token-timer (proactive)
// both call refresh(); this makes concurrent callers share one request instead
// of burning the single-use refresh token twice.
let refreshPromise: Promise<boolean> | null = null;

// Backend returns English messages; the UI is Persian-only.
const FA_MESSAGES = {
  loginFailed: "ایمیل یا رمز عبور اشتباه است.",
  registerFailed: "ثبت‌نام انجام نشد. اطلاعات را بررسی کنید.",
  network: "اتصال به سرور ممکن نیست. لطفاً دوباره تلاش کنید.",
} as const;

function faError(message: string): string {
  return message ? FA_MESSAGES.loginFailed : FA_MESSAGES.network;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  expiresAt: string | null;
  status: AuthStatus;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<boolean>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  refresh: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  // State
  user: null,
  accessToken: null,
  expiresAt: null,
  status: "idle",
  error: null,

  // Actions
  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ status: "loading", error: null });
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        await res.text().catch(() => "");
        set({ status: "unauthenticated", error: FA_MESSAGES.loginFailed });
        return false;
      }

      const data: ClientAuthResponse = await res.json();
      set({
        user: data.user,
        accessToken: data.accessToken,
        expiresAt: data.expiresAt,
        status: "authenticated",
        error: null,
      });
      return true;
    } catch {
      set({ status: "unauthenticated", error: FA_MESSAGES.network });
      return false;
    }
  },

  register: async (name, email, password, confirmPassword) => {
    set({ status: "loading", error: null });
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      if (!res.ok) {
        await res.text().catch(() => "");
        set({ status: "unauthenticated", error: FA_MESSAGES.registerFailed });
        return false;
      }

      const data: ClientAuthResponse = await res.json();
      set({
        user: data.user,
        accessToken: data.accessToken,
        expiresAt: data.expiresAt,
        status: "authenticated",
        error: null,
      });
      return true;
    } catch {
      set({ status: "unauthenticated", error: FA_MESSAGES.network });
      return false;
    }
  },

  logout: async () => {
    // Fire-and-forget to backend, always clear local state
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Logout is idempotent — clear state regardless
    }
    set({
      user: null,
      accessToken: null,
      expiresAt: null,
      status: "unauthenticated",
      error: null,
    });
  },

  restoreSession: async () => {
    // Only restore if we haven't checked yet
    if (get().status !== "idle") return;

    set({ status: "loading" });
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          set({
            user: data.user,
            accessToken: data.accessToken,
            expiresAt: data.expiresAt,
            status: "authenticated",
          });
        } else {
          set({ status: "unauthenticated" });
        }
      } else {
        set({ status: "unauthenticated" });
      }
    } catch {
      set({ status: "unauthenticated" });
    }
  },

  refresh: async () => {
    if (refreshPromise) return refreshPromise;
    refreshPromise = doRefresh(set).finally(() => {
      refreshPromise = null;
    });
    return refreshPromise;
  },
}));

async function doRefresh(
  set: (partial: Partial<AuthState>) => void
): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/refresh", { method: "POST" });
    if (res.status === 429 || res.status >= 500) {
      // Rate-limited or backend down — transient, keep state, caller retries later
      return false;
    }
    if (!res.ok) {
      
      set({
        user: null,
        accessToken: null,
        expiresAt: null,
        status: "unauthenticated",
      });
      return false;
    }

    const data: ClientAuthResponse = await res.json();
    set({
      user: data.user,
      accessToken: data.accessToken,
      expiresAt: data.expiresAt,
      status: "authenticated",
    });
    return true;
  } catch {
    // Network error — not a dead session, don't clear state
    return false;
  }
}
