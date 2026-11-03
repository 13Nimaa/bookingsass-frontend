import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { BusinessDto } from "@/features/business/types";
import { useBusinessStore } from "@/features/business/store/business-store";
import { BusinessForm } from "@/features/business/components/business-form";

vi.mock("@/features/business/components/business-image-field", () => ({
  BusinessImageField: () => <div data-testid="image-field" />,
}));

const sample: BusinessDto = {
  id: 3,
  name: "سالن موجود",
  city: "اصفهان",
  address: "چهارباغ",
  description: "قدیمی",
  profileImageUrl: null,
  ownerId: "owner-1",
};

describe("BusinessForm", () => {
  beforeEach(() => {
    useBusinessStore.setState({
      business: sample,
      status: "loaded",
      error: null,
      uploading: false,
      notice: null,
    });
  });

  it("populates edit fields from initial and submits via update", async () => {
    const update = vi.fn().mockResolvedValue(true);
    useBusinessStore.setState({ update } as never);

    const onDone = vi.fn();
    const user = userEvent.setup();
    render(
      <BusinessForm mode="edit" initial={sample} onDone={onDone} />,
    );

    expect(screen.getByLabelText("نام سالن")).toHaveProperty(
      "value",
      "سالن موجود",
    );
    expect(screen.getByLabelText("شهر")).toHaveProperty("value", "اصفهان");
    expect(screen.getByLabelText("نشانی")).toHaveProperty("value", "چهارباغ");

    await user.clear(screen.getByLabelText("نام سالن"));
    await user.type(screen.getByLabelText("نام سالن"), "سالن به‌روز");
    await user.click(screen.getByRole("button", { name: "ذخیره تغییرات" }));

    await waitFor(() => {
      expect(update).toHaveBeenCalledWith({
        name: "سالن به‌روز",
        city: "اصفهان",
        address: "چهارباغ",
        description: "قدیمی",
      });
    });
    expect(onDone).toHaveBeenCalled();
  });

  it("uses the submit override instead of store.create in create mode", async () => {
    const create = vi.fn();
    const submit = vi.fn().mockResolvedValue(true);
    useBusinessStore.setState({ create } as never);

    const user = userEvent.setup();
    render(
      <BusinessForm
        mode="create"
        submit={submit}
        onDone={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText("نام سالن"), "جدید");
    await user.type(screen.getByLabelText("شهر"), "شیراز");
    await user.type(screen.getByLabelText("نشانی"), "زند");
    await user.click(screen.getByRole("button", { name: "ایجاد سالن" }));

    await waitFor(() => {
      expect(submit).toHaveBeenCalled();
    });
    expect(create).not.toHaveBeenCalled();
  });
});
