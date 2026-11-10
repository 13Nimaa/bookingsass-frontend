import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditEmployeeServiceDialog } from "@/features/employee/components/edit-employee-service-dialog";
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
  priceOverride: 250000,
  durationMinutesOverride: null,
  effectivePrice: 250000,
  effectiveDurationMinutes: 90,
  businessId: 7,
};

function setup(
  updateEmployeeService = vi.fn().mockResolvedValue({ ok: true }),
  current: EmployeeServiceDto = service
) {
  useEmployeeStore.getState().reset();
  useEmployeeStore.setState({ updateEmployeeService });

  const onOpenChange = vi.fn();
  const onUpdated = vi.fn();
  render(
    <EditEmployeeServiceDialog
      open
      onOpenChange={onOpenChange}
      employee={employee}
      service={current}
      onUpdated={onUpdated}
    />
  );
  return { updateEmployeeService, onOpenChange, onUpdated };
}

describe("EditEmployeeServiceDialog", () => {
  beforeEach(() => {
    vi.stubGlobal("navigator", { onLine: true });
  });

  it("shows defaults, effective values, and current override state", () => {
    setup();

    expect(screen.getByText("رنگ مو")).toBeInTheDocument();
    expect(screen.getByText("دارای مبلغ اختصاصی کارمند")).toBeInTheDocument();
    expect(screen.getByText("در حال استفاده از پیش‌فرض سالن")).toBeInTheDocument();
    expect(screen.getByLabelText("قیمت اختصاصی")).toHaveValue("۲۵۰٬۰۰۰");
    expect(screen.getByLabelText("مدت اختصاصی (دقیقه)")).toHaveValue("");
  });

  it("sends only a changed price override", async () => {
    const { updateEmployeeService, onOpenChange, onUpdated } = setup();
    const user = userEvent.setup();

    const price = screen.getByLabelText("قیمت اختصاصی");
    await user.clear(price);
    await user.type(price, "280000");
    await user.click(screen.getByRole("button", { name: "ذخیره تغییرات" }));

    await waitFor(() =>
      expect(updateEmployeeService).toHaveBeenCalledWith(3, 2, {
        priceOverride: 280000,
      })
    );
    expect(onUpdated).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("resets price independently without changing duration", async () => {
    const { updateEmployeeService } = setup();
    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", { name: "بازگشت قیمت به پیش‌فرض" })
    );
    await user.click(screen.getByRole("button", { name: "ذخیره تغییرات" }));

    await waitFor(() =>
      expect(updateEmployeeService).toHaveBeenCalledWith(3, 2, {
        priceOverride: null,
      })
    );
  });

  it("stays open and shows an error when the update fails", async () => {
    const updateEmployeeService = vi.fn().mockResolvedValue({
      ok: false,
      message: "به‌روزرسانی تنظیمات خدمت انجام نشد.",
    });
    const { onOpenChange, onUpdated } = setup(updateEmployeeService);
    const user = userEvent.setup();

    const duration = screen.getByLabelText("مدت اختصاصی (دقیقه)");
    await user.type(duration, "75");
    await user.click(screen.getByRole("button", { name: "ذخیره تغییرات" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "به‌روزرسانی تنظیمات خدمت انجام نشد."
      )
    );
    expect(onUpdated).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
