import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { useAuthStore } from "@/features/auth/store/auth-store";

describe("AuthGuard", () => {
  beforeEach(() => {
    vi.stubGlobal("location", { assign: vi.fn() });
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      status: "idle",
      error: null,
    });
  });

  afterEach(() => {
    useAuthStore.setState({ status: "idle" });
  });

  it("redirects unauthenticated users to /login", async () => {
    useAuthStore.setState({ status: "unauthenticated" });
    render(
      <AuthGuard>
        <div>secret</div>
      </AuthGuard>,
    );

    expect(screen.queryByText("secret")).toBeNull();
    await waitFor(() => {
      expect(window.location.assign).toHaveBeenCalledWith("/login");
    });
  });

  it("renders children when authenticated", () => {
    useAuthStore.setState({
      status: "authenticated",
      accessToken: "tok",
      refreshToken: "ref",
      expiresAt: "2099-01-01T00:00:00.000Z",
      user: {
        userId: "1",
        name: "Ali",
        phoneNumber: "09123456789",
      },
    });

    render(
      <AuthGuard>
        <div>secret</div>
      </AuthGuard>,
    );

    expect(screen.getByText("secret")).toBeTruthy();
    expect(window.location.assign).not.toHaveBeenCalled();
  });
});
