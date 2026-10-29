import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { BusinessImageField } from "@/features/business/components/business-image-field";

function fileInput(): HTMLInputElement {
  return document.querySelector('input[type="file"]') as HTMLInputElement;
}

describe("BusinessImageField", () => {
  it("rejects unsupported file types before calling onSelect", () => {
    const onSelect = vi.fn();
    render(
      <BusinessImageField name="سالن" imageUrl={null} onSelect={onSelect} />,
    );

    // Bypass the accept filter so onChange runs (same path as a browser that
    // still delivers a disallowed file).
    fireEvent.change(fileInput(), {
      target: { files: [new File(["x"], "notes.gif", { type: "image/gif" })] },
    });

    expect(
      screen.getByText("فرمت تصویر باید JPG، PNG یا WebP باشد."),
    ).toBeTruthy();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("rejects files larger than 5MB", () => {
    const onSelect = vi.fn();
    render(
      <BusinessImageField name="سالن" imageUrl={null} onSelect={onSelect} />,
    );

    fireEvent.change(fileInput(), {
      target: {
        files: [
          new File([new Uint8Array(5 * 1024 * 1024 + 1)], "big.jpg", {
            type: "image/jpeg",
          }),
        ],
      },
    });

    expect(
      screen.getByText("حجم تصویر نباید بیشتر از ۵ مگابایت باشد."),
    ).toBeTruthy();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("forwards a valid jpeg to onSelect", () => {
    const onSelect = vi.fn();
    render(
      <BusinessImageField name="سالن" imageUrl={null} onSelect={onSelect} />,
    );

    const ok = new File(["tiny"], "ok.jpg", { type: "image/jpeg" });
    fireEvent.change(fileInput(), { target: { files: [ok] } });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]).toBe(ok);
  });
});
