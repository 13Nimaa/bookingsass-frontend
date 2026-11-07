import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BusinessGalleryField } from "@/features/business/components/business-gallery-field";

vi.mock("@/features/business/store/business-store", () => ({
  useBusinessStore: Object.assign(
    (selector: (s: Record<string, unknown>) => unknown) =>
      selector({
        business: null,
        uploadGallery: vi.fn(),
        deleteGalleryImage: vi.fn(),
        galleryBusy: false,
      }),
    { getState: vi.fn() },
  ),
}));

function fileInput(): HTMLInputElement {
  return document.querySelector('input[type="file"]') as HTMLInputElement;
}

describe("BusinessGalleryField", () => {
  it("shows empty state and rejects unsupported file types", () => {
    render(<BusinessGalleryField deferred />);

    expect(
      screen.getByText("هنوز تصویری به گالری اضافه نکرده‌اید"),
    ).toBeTruthy();

    // Bypass accept so onChange runs (same path as a browser that still
    // delivers a disallowed file).
    fireEvent.change(fileInput(), {
      target: { files: [new File(["x"], "notes.gif", { type: "image/gif" })] },
    });

    expect(
      screen.getByText("فرمت تصویر باید JPG، PNG یا WebP باشد."),
    ).toBeTruthy();
  });

  it("adds a deferred preview thumbnail for a valid image", async () => {
    render(<BusinessGalleryField deferred />);
    fireEvent.change(fileInput(), {
      target: {
        files: [new File(["img"], "salon.png", { type: "image/png" })],
      },
    });

    await waitFor(() => {
      expect(screen.getByLabelText("مشاهده تصویر بزرگ‌تر")).toBeTruthy();
    });
    expect(screen.getByLabelText("افزودن تصویر به گالری")).toBeTruthy();
  });
});
