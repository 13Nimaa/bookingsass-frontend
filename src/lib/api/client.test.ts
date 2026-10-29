import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/http", () => ({
  BACKEND_BASE_URL: "http://backend.test",
}));

vi.mock("@/features/auth/store/auth-store", () => ({
  useAuthStore: {
    getState: vi.fn(),
  },
}));

import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/features/auth/store/auth-store";

const getState = vi.mocked(useAuthStore.getState);

describe("apiClient", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("location", { assign: vi.fn() });
  });

  it("attaches Authorization bearer from the auth store", async () => {
    getState.mockReturnValue({
      accessToken: "tok-1",
      status: "authenticated",
      refresh: vi.fn(),
    } as never);
    vi.mocked(fetch).mockResolvedValue(new Response("ok", { status: 200 }));

    await apiClient("/api/Profile");

    expect(fetch).toHaveBeenCalledWith(
      "http://backend.test/api/Profile",
      expect.objectContaining({
        credentials: "include",
      }),
    );
    const init = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
    expect(new Headers(init.headers).get("Authorization")).toBe("Bearer tok-1");
  });

  it("retries the original request after a successful refresh on 401", async () => {
    const refresh = vi.fn().mockResolvedValue(true);
    getState
      .mockReturnValueOnce({
        accessToken: "old",
        status: "authenticated",
        refresh,
      } as never)
      .mockReturnValueOnce({
        accessToken: "old",
        status: "authenticated",
        refresh,
      } as never)
      .mockReturnValue({
        accessToken: "new",
        status: "authenticated",
        refresh,
      } as never);

    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response("expired", { status: 401 }))
      .mockResolvedValueOnce(new Response("ok", { status: 200 }));

    const res = await apiClient("/api/Profile");

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(res.status).toBe(200);
    const retryHeaders = new Headers(
      (vi.mocked(fetch).mock.calls[1][1] as RequestInit).headers,
    );
    expect(retryHeaders.get("Authorization")).toBe("Bearer new");
  });

  it("redirects to /login when refresh fails with unauthenticated status", async () => {
    const refresh = vi.fn().mockResolvedValue(false);
    getState.mockReturnValue({
      accessToken: "old",
      status: "unauthenticated",
      refresh,
    } as never);
    vi.mocked(fetch).mockResolvedValue(new Response("expired", { status: 401 }));

    const res = await apiClient("/api/Profile");

    expect(res.status).toBe(401);
    expect(window.location.assign).toHaveBeenCalledWith("/login");
  });

  it("does not redirect on failed refresh when status is still authenticated", async () => {
    // Transient refresh failure (e.g. 429) leaves status authenticated.
    const refresh = vi.fn().mockResolvedValue(false);
    getState.mockReturnValue({
      accessToken: "old",
      status: "authenticated",
      refresh,
    } as never);
    vi.mocked(fetch).mockResolvedValue(new Response("expired", { status: 401 }));

    await apiClient("/api/Profile");

    expect(window.location.assign).not.toHaveBeenCalled();
  });
});
