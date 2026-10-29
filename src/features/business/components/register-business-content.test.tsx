import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import type { AuthResponse } from "@/features/auth/types";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: { children?: ReactNode } & Record<string, unknown>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

vi.mock("@/features/auth/components/auth-brand-panel", () => ({
  AuthBrandPanel: () => <div data-testid="brand-panel" />,
}));

vi.mock("@/features/auth/components/auth-logo", () => ({
  AuthLogo: () => <div>logo</div>,
}));

vi.mock("@/lib/api/endpoints/business.endpoints", () => ({
  registerBusinessRequest: vi.fn(),
  createBusinessRequest: vi.fn(),
}));

vi.mock("@/features/auth/store/auth-store", () => ({
  useAuthStore: {
    getState: vi.fn(),
  },
}));

import { registerBusinessRequest, createBusinessRequest } from "@/lib/api/endpoints/business.endpoints";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { RegisterBusinessContent } from "@/features/business/components/register-business-content";

const registerBusinessRequestMock = vi.mocked(registerBusinessRequest);
const createBusinessRequestMock = vi.mocked(createBusinessRequest);
const getState = vi.mocked(useAuthStore.getState);

const session: AuthResponse = {
  user: {
    userId: "user-1",
    name: "مالک",
    phoneNumber: "09123456789",
  },
  accessToken: "access-new",
  refreshToken: "refresh-new",
  expiresAt: "2099-01-01T00:00:00.000Z",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("نام کسب‌وکار"), "سالن آرتا");
  await user.type(screen.getByLabelText("شهر"), "تهران");
  await user.type(screen.getByLabelText("نشانی"), "ولیعصر ۱۲");
}

describe("RegisterBusinessContent", () => {
  beforeEach(() => {
    push.mockReset();
    registerBusinessRequestMock.mockReset();
    createBusinessRequestMock.mockReset();
    getState.mockReturnValue({ applySession: vi.fn() } as never);
  });

  it("shows required-field validation without calling the API", async () => {
    const user = userEvent.setup();
    render(<RegisterBusinessContent />);

    await user.click(screen.getByRole("button", { name: "ایجاد کسب‌وکار" }));

    expect(await screen.findByText("نام کسب‌وکار الزامی است.")).toBeTruthy();
    expect(screen.getByText("شهر الزامی است.")).toBeTruthy();
    expect(screen.getByText("نشانی الزامی است.")).toBeTruthy();
    expect(registerBusinessRequestMock).not.toHaveBeenCalled();
  });

  it("owner flow posts to registerBusinessRequest and applies the rotated session", async () => {
    const applySession = vi.fn();
    getState.mockReturnValue({ applySession } as never);
    registerBusinessRequestMock.mockResolvedValue(jsonResponse(session));

    const user = userEvent.setup();
    render(<RegisterBusinessContent />);
    await fillRequiredFields(user);
    await user.click(
      screen.getByRole("button", { name: "ایجاد کسب‌وکار" }),
    );

    await waitFor(() => {
      expect(registerBusinessRequestMock).toHaveBeenCalledWith({
        name: "سالن آرتا",
        city: "تهران",
        address: "ولیعصر ۱۲",
        description: null,
      });
    });
    expect(createBusinessRequestMock).not.toHaveBeenCalled();
    expect(applySession).toHaveBeenCalledWith(session);
    expect(push).toHaveBeenCalledWith("/dashboard/business");
  });

  it("shows duplicate-business error on 409", async () => {
    registerBusinessRequestMock.mockResolvedValue(
      new Response("conflict", { status: 409 }),
    );

    const user = userEvent.setup();
    render(<RegisterBusinessContent />);
    await fillRequiredFields(user);
    await user.click(
      screen.getByRole("button", { name: "ایجاد کسب‌وکار" }),
    );

    expect(
      await screen.findByText("شما قبلاً یک کسب‌وکار ثبت کرده‌اید."),
    ).toBeTruthy();
    expect(push).not.toHaveBeenCalled();
  });

  it("shows network error when the request fails", async () => {
    registerBusinessRequestMock.mockRejectedValue(
      new TypeError("Failed to fetch"),
    );

    const user = userEvent.setup();
    render(<RegisterBusinessContent />);
    await fillRequiredFields(user);
    await user.click(
      screen.getByRole("button", { name: "ایجاد کسب‌وکار" }),
    );

    expect(
      await screen.findByText(
        "اتصال به سرور ممکن نیست. لطفاً دوباره تلاش کنید.",
      ),
    ).toBeTruthy();
  });

  it("disables the submit button while the request is in flight", async () => {
    let resolve!: (value: Response) => void;
    registerBusinessRequestMock.mockReturnValue(
      new Promise<Response>((r) => {
        resolve = r;
      }),
    );

    const user = userEvent.setup();
    render(<RegisterBusinessContent />);
    await fillRequiredFields(user);
    await user.click(
      screen.getByRole("button", { name: "ایجاد کسب‌وکار" }),
    );

    expect(
      (
        screen.getByRole("button", {
          name: "در حال ذخیره...",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);

    resolve(jsonResponse(session));
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/dashboard/business");
    });
  });
});
