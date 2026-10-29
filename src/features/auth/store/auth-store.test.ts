import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthResponse } from "@/features/auth/types";

vi.mock("@/lib/api/endpoints/auth.endpoints", () => ({
  loginRequest: vi.fn(),
  registerRequest: vi.fn(),
  refreshRequest: vi.fn(),
  logoutRequest: vi.fn(),
}));

import {
  loginRequest,
  registerRequest,
  refreshRequest,
  logoutRequest,
} from "@/lib/api/endpoints/auth.endpoints";
import { useAuthStore } from "@/features/auth/store/auth-store";

const loginRequestMock = vi.mocked(loginRequest);
const registerRequestMock = vi.mocked(registerRequest);
const refreshRequestMock = vi.mocked(refreshRequest);
const logoutRequestMock = vi.mocked(logoutRequest);

const session: AuthResponse = {
  user: {
    userId: "user-1",
    name: "Test User",
    phoneNumber: "09123456789",
  },
  accessToken: "access-token-1",
  refreshToken: "refresh-token-1",
  expiresAt: "2099-01-01T00:00:00.000Z",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function resetStore() {
  localStorage.clear();
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    status: "idle",
    error: null,
  });
}

describe("useAuthStore", () => {
  beforeEach(() => {
    resetStore();
  });

  it("login success updates store and persists bf_session", async () => {
    loginRequestMock.mockResolvedValue(jsonResponse(session));

    const ok = await useAuthStore
      .getState()
      .login("09123456789", "Password1");

    expect(ok).toBe(true);
    const state = useAuthStore.getState();
    expect(state.status).toBe("authenticated");
    expect(state.accessToken).toBe(session.accessToken);
    expect(state.refreshToken).toBe(session.refreshToken);
    expect(state.user).toEqual(session.user);
    expect(JSON.parse(localStorage.getItem("bf_session")!)).toMatchObject({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });
  });

  it("invalid credentials set Persian error and stay logged out", async () => {
    loginRequestMock.mockResolvedValue(new Response("unauthorized", { status: 401 }));

    const ok = await useAuthStore
      .getState()
      .login("09123456789", "wrong");

    expect(ok).toBe(false);
    expect(useAuthStore.getState()).toMatchObject({
      status: "unauthenticated",
      error: "شماره موبایل یا رمز عبور اشتباه است.",
      accessToken: null,
    });
    expect(localStorage.getItem("bf_session")).toBeNull();
  });

  it("network failure during login does not crash and surfaces network error", async () => {
    loginRequestMock.mockRejectedValue(new TypeError("Failed to fetch"));

    const ok = await useAuthStore
      .getState()
      .login("09123456789", "Password1");

    expect(ok).toBe(false);
    expect(useAuthStore.getState()).toMatchObject({
      status: "unauthenticated",
      error: "اتصال به سرور ممکن نیست. لطفاً دوباره تلاش کنید.",
    });
  });

  it("failed register leaves the store unauthenticated", async () => {
    registerRequestMock.mockResolvedValue(
      new Response("duplicate", { status: 409 }),
    );

    const ok = await useAuthStore
      .getState()
      .register("Ali", "09123456789", "Password1", "Password1");

    expect(ok).toBe(false);
    expect(useAuthStore.getState()).toMatchObject({
      status: "unauthenticated",
      error: "ثبت‌نام انجام نشد. اطلاعات را بررسی کنید.",
      accessToken: null,
    });
    expect(localStorage.getItem("bf_session")).toBeNull();
  });

  it("successful register applies session like login", async () => {
    registerRequestMock.mockResolvedValue(jsonResponse(session));

    const ok = await useAuthStore
      .getState()
      .register("Ali", "09123456789", "Password1", "Password1");

    expect(ok).toBe(true);
    expect(useAuthStore.getState().status).toBe("authenticated");
    expect(localStorage.getItem("bf_session")).not.toBeNull();
  });

  it("logout clears memory and bf_session", async () => {
    useAuthStore.getState().applySession(session);
    logoutRequestMock.mockResolvedValue(new Response(null, { status: 204 }));

    await useAuthStore.getState().logout();

    expect(logoutRequestMock).toHaveBeenCalledWith(session.refreshToken);
    expect(useAuthStore.getState()).toMatchObject({
      status: "unauthenticated",
      accessToken: null,
      refreshToken: null,
      user: null,
    });
    expect(localStorage.getItem("bf_session")).toBeNull();
  });

  it("malformed bf_session restores as unauthenticated", async () => {
    localStorage.setItem("bf_session", "{not-json");

    await useAuthStore.getState().restoreSession();

    expect(useAuthStore.getState().status).toBe("unauthenticated");
  });

  it("missing bf_session restores as unauthenticated", async () => {
    await useAuthStore.getState().restoreSession();
    expect(useAuthStore.getState().status).toBe("unauthenticated");
  });

  it("restoreSession refreshes a stored session", async () => {
    localStorage.setItem(
      "bf_session",
      JSON.stringify({
        user: session.user,
        accessToken: "old-access",
        refreshToken: "old-refresh",
        expiresAt: session.expiresAt,
      }),
    );
    const rotated: AuthResponse = {
      ...session,
      accessToken: "new-access",
      refreshToken: "new-refresh",
    };
    refreshRequestMock.mockResolvedValue(jsonResponse(rotated));

    await useAuthStore.getState().restoreSession();

    expect(refreshRequestMock).toHaveBeenCalledWith("old-refresh");
    expect(useAuthStore.getState()).toMatchObject({
      status: "authenticated",
      accessToken: "new-access",
      refreshToken: "new-refresh",
    });
  });

  it("failed refresh clears invalid session", async () => {
    useAuthStore.getState().applySession(session);
    refreshRequestMock.mockResolvedValue(new Response("expired", { status: 401 }));

    const ok = await useAuthStore.getState().refresh();

    expect(ok).toBe(false);
    expect(useAuthStore.getState().status).toBe("unauthenticated");
    expect(localStorage.getItem("bf_session")).toBeNull();
  });

  it("network error during refresh keeps existing session", async () => {
    useAuthStore.getState().applySession(session);
    refreshRequestMock.mockRejectedValue(new TypeError("offline"));

    const ok = await useAuthStore.getState().refresh();

    expect(ok).toBe(false);
    expect(useAuthStore.getState()).toMatchObject({
      status: "authenticated",
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });
    expect(localStorage.getItem("bf_session")).not.toBeNull();
  });

  it("concurrent refresh callers share one request (single-flight)", async () => {
    useAuthStore.getState().applySession(session);
    let resolveRefresh!: (value: Response) => void;
    refreshRequestMock.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveRefresh = resolve;
      }),
    );

    const first = useAuthStore.getState().refresh();
    const second = useAuthStore.getState().refresh();

    resolveRefresh(jsonResponse({
      ...session,
      accessToken: "shared-access",
      refreshToken: "shared-refresh",
    }));

    await expect(Promise.all([first, second])).resolves.toEqual([true, true]);
    expect(refreshRequestMock).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().accessToken).toBe("shared-access");
  });

  it("429 refresh is treated as transient and does not clear session", async () => {
    useAuthStore.getState().applySession(session);
    refreshRequestMock.mockResolvedValue(new Response("slow down", { status: 429 }));

    const ok = await useAuthStore.getState().refresh();

    expect(ok).toBe(false);
    expect(useAuthStore.getState().status).toBe("authenticated");
    expect(localStorage.getItem("bf_session")).not.toBeNull();
  });
});
