import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmployeeServicesDrawer } from "@/features/employee/components/employee-services-drawer";
import { useEmployeeStore } from "@/features/employee/store/employee-store";
import type {
  EmployeeDto,
  EmployeeServiceDto,
} from "@/features/employee/types";

const employee: EmployeeDto = {
  id: 3,
  userId: "user-3",
  fullName: "سارا محمدی",
  phoneNumber: "09120000000",
  businessId: 7,
};

const service: EmployeeServiceDto = {
  id: 2,
  title: "رنگ مو",
  defaultPrice: 300000,
  defaultDurationMinutes: 90,
  priceOverride: null,
  durationMinutesOverride: null,
  effectivePrice: 300000,
  effectiveDurationMinutes: 90,
  businessId: 7,
};

function setup(
  removeEmployeeService = vi.fn().mockResolvedValue({ ok: true })
) {
  useEmployeeStore.getState().reset();
  useEmployeeStore.setState({
    removeEmployeeService,
    servicesByEmployee: {
      [employee.id]: {
        items: [service],
        status: "loaded",
        error: null,
      },
    },
  });

  const onOpenChange = vi.fn();
  render(
    <EmployeeServicesDrawer
      open
      onOpenChange={onOpenChange}
      employee={employee}
    />
  );
  return { removeEmployeeService, onOpenChange };
}

describe("EmployeeServicesDrawer remove flow", () => {
  beforeEach(() => {
    vi.stubGlobal("navigator", { onLine: true });
  });

  it("requires confirmation and unassigns with the correct ids", async () => {
    const { removeEmployeeService } = setup();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "حذف رنگ مو" }));
    expect(
      screen.getByRole("heading", { name: "حذف خدمت از کارمند" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/فقط اختصاص خدمت به این کارمند را برمی‌دارد/)
    ).toBeInTheDocument();
    expect(removeEmployeeService).not.toHaveBeenCalled();

    await user.click(
      screen.getByRole("button", { name: "حذف از خدمات کارمند" })
    );

    await waitFor(() =>
      expect(removeEmployeeService).toHaveBeenCalledWith(3, 2)
    );
  });

  it("keeps the confirm dialog open and shows an error on failure", async () => {
    const removeEmployeeService = vi.fn().mockResolvedValue({
      ok: false,
      message: "حذف خدمت از کارمند انجام نشد.",
    });
    setup(removeEmployeeService);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "حذف رنگ مو" }));
    await user.click(
      screen.getByRole("button", { name: "حذف از خدمات کارمند" })
    );

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "حذف خدمت از کارمند انجام نشد."
      )
    );
    expect(
      screen.getByRole("heading", { name: "حذف خدمت از کارمند" })
    ).toBeInTheDocument();
    expect(screen.getByText("رنگ مو")).toBeInTheDocument();
  });
});
