import { create } from "zustand";
import type {
  User,
  AuthStatus,
  AuthResponse,
} from "@/features/auth/types";
import {
  loginRequest,
  registerRequest,
  refreshRequest,
  logoutRequest,
} from "@/lib/api/endpoints/auth.endpoints";

// Single-flight guard: api-client (reactive 401) and token-timer (proactive)
// both call refresh(); this makes concurrent callers share one request instead
// of burning the single-use refresh token twice.
let refreshPromise: Promise<boolean> | null = null;

// Backend returns English messages; the UI is Persian-only.
const FA_MESSAGES = {
  loginFailed: "شماره موبایل یا رمز عبور اشتباه است.",
  registerFailed: "ثبت‌نام انجام نشد. اطلاعات را بررسی کنید.",
  network: "اتصال به سرور ممکن نیست. لطفاً دوباره تلاش کنید.",
} as const;

// Session persistence. Without the BFF's HttpOnly cookie there is no
// server-readable session, so the tokens live in localStorage to survive
// reloads. Tradeoff: JS-readable tokens are stealable via XSS — the backend
// should move to cookie-based SPA auth when possible.
const STORAGE_KEY = "bf_session";

interface StoredSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

function readStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredSession;
    if (!data?.accessToken || !data?.refreshToken || !data?.user) return null;
    return data;
  } catch {
    return null;
  }
}

function writeStoredSession(session: StoredSession | null) {
  if (typeof window === "undefined") return;
  try {
    if (!session) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Storage unavailable (private mode, blocked) — session stays in memory.
  }
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
  status: AuthStatus;
  error: string | null;
}

interface AuthActions {
  login: (phoneNumber: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    phoneNumber: string,
    password: string,
    confirmPassword: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  refresh: () => Promise<boolean>;
  // Applies a fresh backend session (login, register, refresh, or
  // post-registration business creation which rotates tokens).
  applySession: (data: AuthResponse) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  // State
  user: null,
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  status: "idle",
  error: null,

  // Actions
  clearError: () => set({ error: null }),

  applySession: (data) => {
    set({
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt,
      status: "authenticated",
      error: null,
    });
    writeStoredSession({
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt,
    });
  },

  login: async (phoneNumber, password) => {
    set({ status: "loading", error: null });
    try {
      const res = await loginRequest({ phoneNumber, password });

      if (!res.ok) {
        await res.text().catch(() => "");
        set({ status: "unauthenticated", error: FA_MESSAGES.loginFailed });
        return false;
      }

      const data: AuthResponse = await res.json();
      get().applySession(data);
      return true;
    } catch {
      set({ status: "unauthenticated", error: FA_MESSAGES.network });
      return false;
    }
  },

  register: async (name, phoneNumber, password, confirmPassword) => {
    set({ status: "loading", error: null });
    try {
      const res = await registerRequest({
        name,
        phoneNumber,
        password,
        confirmPassword,
      });

      if (!res.ok) {
        await res.text().catch(() => "");
        set({ status: "unauthenticated", error: FA_MESSAGES.registerFailed });
        return false;
      }

      const data: AuthResponse = await res.json();
      get().applySession(data);
      return true;
    } catch {
      set({ status: "unauthenticated", error: FA_MESSAGES.network });
      return false;
    }
  },

  logout: async () => {
    // Fire-and-forget to backend, always clear local state
    const refreshToken = get().refreshToken;
    try {
      if (refreshToken) await logoutRequest(refreshToken);
    } catch {
      // Logout is idempotent — clear state regardless
    }
    writeStoredSession(null);
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      status: "unauthenticated",
      error: null,
    });
  },

  restoreSession: async () => {
    // Only restore if we haven't checked yet
    if (get().status !== "idle") return;

    const stored = readStoredSession();
    if (!stored) {
      set({ status: "unauthenticated" });
      return;
    }

    // Seed state from storage, then validate by rotating (mirrors the old
    // session endpoint, which rotated the single-use refresh token).
    set({
      user: stored.user,
      accessToken: stored.accessToken,
      refreshToken: stored.refreshToken,
      expiresAt: stored.expiresAt,
      status: "loading",
      error: null,
    });

    const ok = await get().refresh();
    if (ok) return; // refresh() applied + persisted the rotated session
    if (get().status === "unauthenticated") return; // dead session, cleared

    // Transient failure (offline, rate-limited) — keep the stored session;
    // the token timer and api-client retries will renew it.
    set({
      user: stored.user,
      accessToken: stored.accessToken,
      refreshToken: stored.refreshToken,
      expiresAt: stored.expiresAt,
      status: "authenticated",
    });
  },

  refresh: async () => {
    if (refreshPromise) return refreshPromise;
    refreshPromise = doRefresh(set, get).finally(() => {
      refreshPromise = null;
    });
    return refreshPromise;
  },
}));

async function doRefresh(
  set: (partial: Partial<AuthState>) => void,
  get: () => AuthState
): Promise<boolean> {
  const refreshToken = get().refreshToken;
  if (!refreshToken) {
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      status: "unauthenticated",
    });
    return false;
  }

  try {
    const res = await refreshRequest(refreshToken);
    if (res.status === 429 || res.status >= 500) {
      // Rate-limited or backend down — transient, keep state, caller retries later
      return false;
    }
    if (!res.ok) {
      writeStoredSession(null);
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        status: "unauthenticated",
      });
      return false;
    }

    const data: AuthResponse = await res.json();
    set({
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt,
      status: "authenticated",
    });
    writeStoredSession({
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt,
    });
    return true;
  } catch {
    // Network error — not a dead session, don't clear state
    return false;
  }
}
