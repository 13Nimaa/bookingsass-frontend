import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddEmployeeServiceDialog } from "@/features/employee/components/add-employee-service-dialog";
import { useEmployeeStore } from "@/features/employee/store/employee-store";
import { useServiceStore } from "@/features/service/store/service-store";
import type { EmployeeDto } from "@/features/employee/types";
import type { ServiceDto } from "@/features/service/types";

const employee: EmployeeDto = {
  id: 3,
  userId: "user-3",
  fullName: "سارا محمدی",
  phoneNumber: "09120000000",
  businessId: 7,
};

const assigned: ServiceDto = {
  id: 1,
  title: "کوتاهی مو",
  price: 150000,
  durationMinutes: 30,
  businessId: 7,
};

const available: ServiceDto = {
  id: 2,
  title: "رنگ مو",
  price: 300000,
  durationMinutes: 90,
  businessId: 7,
};

function setup(assignServices = vi.fn().mockResolvedValue({ assigned: 1, failed: [] })) {
  useEmployeeStore.getState().reset();
  useEmployeeStore.setState({ assignServices });
  useServiceStore.getState().reset();
  useServiceStore.setState({
    services: [assigned, available],
    status: "loaded",
    error: null,
  });

  const onOpenChange = vi.fn();
  const onAssigned = vi.fn();
  render(
    <AddEmployeeServiceDialog
      open
      onOpenChange={onOpenChange}
      employee={employee}
      assignedServiceIds={[assigned.id]}
      onAssigned={onAssigned}
    />
  );
  return { assignServices, onOpenChange, onAssigned };
}

describe("AddEmployeeServiceDialog", () => {
  beforeEach(() => {
    vi.stubGlobal("navigator", { onLine: true });
  });

  it("excludes already-assigned services and submits defaults without overrides", async () => {
    const { assignServices, onOpenChange, onAssigned } = setup();
    const user = userEvent.setup();

    expect(screen.queryByText("کوتاهی مو")).not.toBeInTheDocument();
    expect(screen.getByText("رنگ مو")).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: /رنگ مو/ }));
    await user.click(screen.getByRole("button", { name: "افزودن خدمت" }));

    await waitFor(() =>
      expect(assignServices).toHaveBeenCalledWith(3, [{ serviceId: 2 }])
    );
    expect(onAssigned).toHaveBeenCalledWith(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("sends a price override without forcing a duration override", async () => {
    const { assignServices } = setup();
    const user = userEvent.setup();

    await user.click(screen.getByRole("checkbox", { name: /رنگ مو/ }));
    await user.type(screen.getByLabelText("قیمت اختصاصی"), "120000");
    await user.click(screen.getByRole("button", { name: "افزودن خدمت" }));

    await waitFor(() =>
      expect(assignServices).toHaveBeenCalledWith(3, [
        { serviceId: 2, priceOverride: 120000 },
      ])
    );
  });

  it("shows a mixed result and stays open on partial failure", async () => {
    const assignServices = vi
      .fn()
      .mockResolvedValue({
        assigned: 1,
        failed: [{ serviceId: 2, message: "تعارض رخ داد.", status: 409 }],
      });
    const { onOpenChange } = setup(assignServices);
    const user = userEvent.setup();

    await user.click(screen.getByRole("checkbox", { name: /رنگ مو/ }));
    await user.click(screen.getByRole("button", { name: "افزودن خدمت" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /خدمت اختصاص یافت، اما/
      )
    );
    expect(screen.getByRole("alert")).toHaveTextContent("تعارض رخ داد.");
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    // The failed service remains selected for a retry.
    expect(screen.getByRole("checkbox", { name: /رنگ مو/ })).toBeChecked();
  });
});
