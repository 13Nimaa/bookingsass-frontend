import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BusinessDto, MyBusinessResponse } from "@/features/business/types";

vi.mock("@/lib/api/endpoints/business.endpoints", () => ({
  getMineBusiness: vi.fn(),
  createBusinessRequest: vi.fn(),
  updateBusinessRequest: vi.fn(),
  uploadBusinessImageRequest: vi.fn(),
  deleteBusinessImageRequest: vi.fn(),
}));

import {
  getMineBusiness,
  createBusinessRequest,
  updateBusinessRequest,
  uploadBusinessImageRequest,
  deleteBusinessImageRequest,
} from "@/lib/api/endpoints/business.endpoints";
import { useBusinessStore } from "@/features/business/store/business-store";

const getMineBusinessMock = vi.mocked(getMineBusiness);
const createBusinessRequestMock = vi.mocked(createBusinessRequest);
const updateBusinessRequestMock = vi.mocked(updateBusinessRequest);
const uploadBusinessImageRequestMock = vi.mocked(uploadBusinessImageRequest);
const deleteBusinessImageRequestMock = vi.mocked(deleteBusinessImageRequest);

const sampleBusiness: BusinessDto = {
  id: 7,
  name: "سالن آرتا",
  city: "تهران",
  address: "ولیعصر ۱۲",
  description: "توضیح",
  profileImageUrl: null,
  ownerId: "owner-1",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function resetStore() {
  useBusinessStore.setState({
    business: null,
    status: "idle",
    error: null,
    uploading: false,
    notice: null,
  });
}

describe("useBusinessStore", () => {
  beforeEach(() => {
    resetStore();
    vi.stubGlobal("navigator", { onLine: true });
  });

  it("fetchMine loads the current user's business", async () => {
    const body: MyBusinessResponse = {
      hasBusiness: true,
      business: sampleBusiness,
    };
    getMineBusinessMock.mockResolvedValue(jsonResponse(body));

    await useBusinessStore.getState().fetchMine();

    expect(useBusinessStore.getState()).toMatchObject({
      business: sampleBusiness,
      status: "loaded",
      error: null,
    });
  });

  it("fetchMine treats hasBusiness=false as notFound", async () => {
    getMineBusinessMock.mockResolvedValue(
      jsonResponse({ hasBusiness: false, business: null } satisfies MyBusinessResponse),
    );

    await useBusinessStore.getState().fetchMine();

    expect(useBusinessStore.getState()).toMatchObject({
      business: null,
      status: "notFound",
    });
  });

  it("fetchMine maps HTTP 404 to notFound", async () => {
    getMineBusinessMock.mockResolvedValue(new Response("", { status: 404 }));

    await useBusinessStore.getState().fetchMine();

    expect(useBusinessStore.getState()).toMatchObject({
      business: null,
      status: "notFound",
    });
  });

  it("fetchMine keeps prior business null and sets error on unauthorized", async () => {
    getMineBusinessMock.mockResolvedValue(new Response("no", { status: 401 }));

    await useBusinessStore.getState().fetchMine();

    expect(useBusinessStore.getState()).toMatchObject({
      status: "error",
      error: "دریافت اطلاعات سالن ممکن نشد.",
      business: null,
    });
  });

  it("create updates store from bare BusinessDto", async () => {
    createBusinessRequestMock.mockResolvedValue(jsonResponse(sampleBusiness));

    const ok = await useBusinessStore.getState().create({
      name: sampleBusiness.name,
      city: sampleBusiness.city,
      address: sampleBusiness.address,
      description: sampleBusiness.description,
    });

    expect(ok).toBe(true);
    expect(createBusinessRequestMock).toHaveBeenCalled();
    expect(useBusinessStore.getState()).toMatchObject({
      business: sampleBusiness,
      status: "loaded",
      error: null,
    });
  });

  it("create unwraps { data: BusinessDto } envelopes", async () => {
    createBusinessRequestMock.mockResolvedValue(
      jsonResponse({ message: "ok", data: sampleBusiness }),
    );

    const ok = await useBusinessStore.getState().create({
      name: sampleBusiness.name,
      city: sampleBusiness.city,
      address: sampleBusiness.address,
      description: null,
    });

    expect(ok).toBe(true);
    expect(useBusinessStore.getState().business).toEqual(sampleBusiness);
  });

  it("failed create does not leave a partial business in the store", async () => {
    useBusinessStore.setState({ business: sampleBusiness, status: "loaded" });
    createBusinessRequestMock.mockResolvedValue(new Response("bad", { status: 400 }));

    const ok = await useBusinessStore.getState().create({
      name: "x",
      city: "y",
      address: "z",
      description: null,
    });

    expect(ok).toBe(false);
    expect(useBusinessStore.getState()).toMatchObject({
      business: sampleBusiness,
      status: "loaded",
      error: "ایجاد سالن انجام نشد.",
    });
  });

  it("update writes the returned business and handles 403", async () => {
    useBusinessStore.setState({ business: sampleBusiness, status: "loaded" });
    const updated = { ...sampleBusiness, name: "سالن جدید" };
    updateBusinessRequestMock.mockResolvedValue(jsonResponse(updated));

    const ok = await useBusinessStore.getState().update({
      name: updated.name,
      city: updated.city,
      address: updated.address,
      description: updated.description,
    });

    expect(ok).toBe(true);
    expect(updateBusinessRequestMock).toHaveBeenCalledWith(7, expect.any(Object));
    expect(useBusinessStore.getState().business?.name).toBe("سالن جدید");

    updateBusinessRequestMock.mockResolvedValue(new Response("", { status: 403 }));
    const denied = await useBusinessStore.getState().update({
      name: "nope",
      city: "تهران",
      address: "a",
      description: null,
    });
    expect(denied).toBe(false);
    expect(useBusinessStore.getState().error).toBe("شما به این سالن دسترسی ندارید.");
    expect(useBusinessStore.getState().business?.name).toBe("سالن جدید");
  });

  it("update returns false without calling the API when no business is loaded", async () => {
    const ok = await useBusinessStore.getState().update({
      name: "a",
      city: "b",
      address: "c",
      description: null,
    });
    expect(ok).toBe(false);
    expect(updateBusinessRequestMock).not.toHaveBeenCalled();
  });

  it("uploadImage updates profileImageUrl and deleteImage clears it", async () => {
    useBusinessStore.setState({ business: sampleBusiness, status: "loaded" });
    uploadBusinessImageRequestMock.mockResolvedValue(
      jsonResponse({ profileImageUrl: "https://cdn.test/b.jpg" }),
    );

    const uploaded = await useBusinessStore.getState().uploadImage(
      new File(["x"], "b.jpg", { type: "image/jpeg" }),
    );
    expect(uploaded).toBe(true);
    expect(useBusinessStore.getState()).toMatchObject({
      business: { ...sampleBusiness, profileImageUrl: "https://cdn.test/b.jpg" },
      notice: "تصویر سالن با موفقیت به‌روزرسانی شد.",
      uploading: false,
    });

    deleteBusinessImageRequestMock.mockResolvedValue(new Response("", { status: 200 }));
    const deleted = await useBusinessStore.getState().deleteImage();
    expect(deleted).toBe(true);
    expect(useBusinessStore.getState().business?.profileImageUrl).toBeNull();
    expect(useBusinessStore.getState().notice).toBe("تصویر سالن حذف شد.");
  });

  it("network errors surface a Persian message without clearing loaded business", async () => {
    useBusinessStore.setState({ business: sampleBusiness, status: "loaded" });
    updateBusinessRequestMock.mockRejectedValue(new TypeError("Failed to fetch"));

    const ok = await useBusinessStore.getState().update({
      name: sampleBusiness.name,
      city: sampleBusiness.city,
      address: sampleBusiness.address,
      description: null,
    });

    expect(ok).toBe(false);
    expect(useBusinessStore.getState()).toMatchObject({
      business: sampleBusiness,
      error: "اتصال به سرور ممکن نیست. لطفاً دوباره تلاش کنید.",
    });
  });
});
