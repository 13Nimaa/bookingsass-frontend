"use client";

import { create } from "zustand";
import { apiClient } from "@/lib/api-client";
import type { BusinessDto, BusinessInput } from "@/types/business";

export type BusinessStatus = "idle" | "loading" | "loaded" | "notFound" | "error";

interface BusinessState {
  business: BusinessDto | null;
  status: BusinessStatus;
  error: string | null;
  fetchMine: () => Promise<void>;
  create: (input: BusinessInput) => Promise<boolean>;
  update: (input: BusinessInput) => Promise<boolean>;
  clearError: () => void;
}

const FA_MESSAGES = {
  fetchFailed: "دریافت اطلاعات کسب‌وکار ممکن نشد.",
  createFailed: "ایجاد کسب‌وکار انجام نشد.",
  updateFailed: "ذخیره تغییرات انجام نشد.",
  network: "اتصال به سرور ممکن نیست. لطفاً دوباره تلاش کنید.",
} as const;

async function readError(res: Response, fallback: string): Promise<string> {
  if (!navigator.onLine) return FA_MESSAGES.network;
  await res.text().catch(() => "");
  return fallback;
}

export const useBusinessStore = create<BusinessState>((set) => ({
  business: null,
  status: "idle",
  error: null,

  clearError: () => set({ error: null }),

  fetchMine: async () => {
    set({ status: "loading", error: null });
    try {
      const res = await apiClient("/api/business/mine");
      if (res.status === 404) {
        // No business yet — a state, not an error
        set({ business: null, status: "notFound" });
        return;
      }
      if (!res.ok) {
        set({ status: "error", error: await readError(res, FA_MESSAGES.fetchFailed) });
        return;
      }
      const data: BusinessDto = await res.json();
      set({ business: data, status: "loaded" });
    } catch {
      set({ status: "error", error: FA_MESSAGES.network });
    }
  },

  create: async (input) => {
    try {
      const res = await apiClient("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        set({ error: await readError(res, FA_MESSAGES.createFailed) });
        return false;
      }
      const data: BusinessDto = await res.json();
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
      const res = await apiClient(`/api/business/${current.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (res.status === 403) {
        set({ error: "شما به این کسب‌وکار دسترسی ندارید." });
        return false;
      }
      if (!res.ok) {
        set({ error: await readError(res, FA_MESSAGES.updateFailed) });
        return false;
      }
      const data: BusinessDto = await res.json();
      set({ business: data, error: null });
      return true;
    } catch {
      set({ error: FA_MESSAGES.network });
      return false;
    }
  },
}));
