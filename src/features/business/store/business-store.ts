"use client";

import { create } from "zustand";
import {
  getMineBusiness,
  createBusinessRequest,
  updateBusinessRequest,
  uploadBusinessImageRequest,
  deleteBusinessImageRequest,
} from "@/lib/api/endpoints/business.endpoints";
import type { BusinessDto, BusinessInput, MyBusinessResponse } from "@/features/business/types";

export type BusinessStatus = "idle" | "loading" | "loaded" | "notFound" | "error";

interface BusinessState {
  business: BusinessDto | null;
  status: BusinessStatus;
  error: string | null;
  uploading: boolean;
  notice: string | null;
  fetchMine: () => Promise<void>;
  create: (input: BusinessInput) => Promise<boolean>;
  update: (input: BusinessInput) => Promise<boolean>;
  uploadImage: (file: File) => Promise<boolean>;
  deleteImage: () => Promise<boolean>;
  clearError: () => void;
  clearNotice: () => void;
}

const FA_MESSAGES = {
  fetchFailed: "دریافت اطلاعات کسب‌وکار ممکن نشد.",
  createFailed: "ایجاد کسب‌وکار انجام نشد.",
  updateFailed: "ذخیره تغییرات انجام نشد.",
  uploadFailed: "آپلود تصویر انجام نشد.",
  deleteFailed: "حذف تصویر انجام نشد.",
  network: "اتصال به سرور ممکن نیست. لطفاً دوباره تلاش کنید.",
  imageUpdated: "تصویر کسب‌وکار با موفقیت به‌روزرسانی شد.",
  imageDeleted: "تصویر کسب‌وکار حذف شد.",
} as const;

async function readError(res: Response, fallback: string): Promise<string> {
  if (!navigator.onLine) return FA_MESSAGES.network;
  await res.text().catch(() => "");
  return fallback;
}

// Write endpoints respond with either a bare BusinessDto or an envelope
// ({ message, data: BusinessDto }). Normalize both so callers always get the
// DTO — otherwise the envelope gets stored and its fields render as empty.
function unwrapBusiness(body: unknown): BusinessDto | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  const candidate = "data" in record ? record.data : record;
  if (!candidate || typeof candidate !== "object") return null;
  return candidate as BusinessDto;
}

export const useBusinessStore = create<BusinessState>((set, get) => ({
  business: null,
  status: "idle",
  error: null,
  uploading: false,
  notice: null,

  clearError: () => set({ error: null }),
  clearNotice: () => set({ notice: null }),

  fetchMine: async () => {
    set({ status: "loading", error: null });
    try {
      const res = await getMineBusiness();

      if (res.status === 404) {
        set({ business: null, status: "notFound" });
        return;
      }
      if (!res.ok) {
        set({ status: "error", error: await readError(res, FA_MESSAGES.fetchFailed) });
        return;
      }
      const data: MyBusinessResponse = await res.json();
      if (!data.hasBusiness || !data.business) {
        // No business yet — a state, not an error
        set({ business: null, status: "notFound" });
        return;
      }
      set({ business: data.business, status: "loaded" });
    } catch {
      set({ status: "error", error: FA_MESSAGES.network });
    }
  },

  create: async (input) => {
    try {
      const res = await createBusinessRequest(input);
      if (!res.ok) {
        set({ error: await readError(res, FA_MESSAGES.createFailed) });
        return false;
      }
      const data = unwrapBusiness(await res.json());
      if (!data) {
        set({ error: FA_MESSAGES.createFailed });
        return false;
      }
      set({ business: data, status: "loaded", error: null });
      return true;
    } catch {
      set({ error: FA_MESSAGES.network });
      return false;
    }
  },

  update: async (input) => {
    const current = useBusinessStore.getState().business;
    if (!current) return false;
    try {
      const res = await updateBusinessRequest(current.id, input);
      if (res.status === 403) {
        set({ error: "شما به این کسب‌وکار دسترسی ندارید." });
        return false;
      }
      if (!res.ok) {
        set({ error: await readError(res, FA_MESSAGES.updateFailed) });
        return false;
      }
      const data = unwrapBusiness(await res.json());
      if (!data) {
        set({ error: FA_MESSAGES.updateFailed });
        return false;
      }
      set({ business: data, error: null });
      return true;
    } catch {
      set({ error: FA_MESSAGES.network });
      return false;
    }
  },

  uploadImage: async (file) => {
    set({ uploading: true, error: null, notice: null });
    try {
      const res = await uploadBusinessImageRequest(file);
      if (!res.ok) {
        set({ error: await readError(res, FA_MESSAGES.uploadFailed) });
        return false;
      }
      const body = (await res.json()) as {
        profileImageUrl?: string;
        profileimageUrl?: string;
      };
      const url = body.profileImageUrl ?? body.profileimageUrl ?? null;
      const current = get().business;
      if (current && url) set({ business: { ...current, profileImageUrl: url } });
      else await get().fetchMine();
      set({ notice: FA_MESSAGES.imageUpdated });
      return true;
    } catch {
      set({ error: FA_MESSAGES.network });
      return false;
    } finally {
      set({ uploading: false });
    }
  },

  deleteImage: async () => {
    set({ uploading: true, error: null, notice: null });
    try {
      const res = await deleteBusinessImageRequest();
      if (!res.ok) {
        set({ error: await readError(res, FA_MESSAGES.deleteFailed) });
        return false;
      }
      const current = get().business;
      if (current) set({ business: { ...current, profileImageUrl: null } });
      set({ notice: FA_MESSAGES.imageDeleted });
      return true;
    } catch {
      set({ error: FA_MESSAGES.network });
      return false;
    } finally {
      set({ uploading: false });
    }
  },
}));
