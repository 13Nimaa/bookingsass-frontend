"use client";

import { create } from "zustand";
import {
  getCustomerDashboardRequest,
  parseCustomerDashboard,
} from "@/lib/api/endpoints/customer-dashboard.endpoints";
import { cancelBookingRequest } from "@/lib/api/endpoints/booking.endpoints";
import type { CustomerDashboardDto } from "@/features/customer/types";

export type CustomerDashboardStatus =
  | "idle"
  | "loading"
  | "loaded"
  | "error";

interface CustomerDashboardState {
  data: CustomerDashboardDto | null;
  status: CustomerDashboardStatus;
  error: string | null;
  cancellingId: number | null;
  cancelError: string | null;
  fetchDashboard: () => Promise<void>;
  cancelBooking: (bookingId: number) => Promise<boolean>;
  clearError: () => void;
  clearCancelError: () => void;
}

const FA_MESSAGES = {
  fetchFailed: "دریافت داشبورد ممکن نشد.",
  cancelFailed: "لغو رزرو انجام نشد.",
  cancelNotAllowed: "لغو این رزرو مجاز نیست.",
  network: "اتصال به سرور ممکن نیست. لطفاً دوباره تلاش کنید.",
} as const;

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const data = (await res.json()) as {
      message?: string;
      title?: string;
      errors?: Record<string, string[]>;
    };
    if (data?.errors && typeof data.errors === "object") {
      const first = Object.values(data.errors).flat()[0];
      if (typeof first === "string" && first.trim()) return first;
    }
    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message;
    }
  } catch {
    // fall through
  }
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return FA_MESSAGES.network;
  }
  return fallback;
}

let requestSeq = 0;

export const useCustomerDashboardStore = create<CustomerDashboardState>(
  (set, get) => ({
    data: null,
    status: "idle",
    error: null,
    cancellingId: null,
    cancelError: null,

    clearError: () => set({ error: null }),
    clearCancelError: () => set({ cancelError: null }),

    fetchDashboard: async () => {
      const seq = ++requestSeq;
      set({ status: "loading", error: null });
      try {
        const res = await getCustomerDashboardRequest();
        if (seq !== requestSeq) return;

        if (res.status === 401) {
          set({ status: "error", error: FA_MESSAGES.fetchFailed, data: null });
          return;
        }
        if (!res.ok) {
          set({
            status: "error",
            error: await readError(res, FA_MESSAGES.fetchFailed),
            data: null,
          });
          return;
        }

        const body: unknown = await res.json();
        if (seq !== requestSeq) return;
        set({
          data: parseCustomerDashboard(body),
          status: "loaded",
          error: null,
        });
      } catch {
        if (seq !== requestSeq) return;
        set({ status: "error", error: FA_MESSAGES.network, data: null });
      }
    },

    cancelBooking: async (bookingId) => {
      if (get().cancellingId != null) return false;
      set({ cancellingId: bookingId, cancelError: null });
      try {
        const res = await cancelBookingRequest(bookingId);
        if (res.status === 400) {
          set({
            cancellingId: null,
            cancelError: await readError(res, FA_MESSAGES.cancelNotAllowed),
          });
          return false;
        }
        if (!res.ok) {
          set({
            cancellingId: null,
            cancelError: await readError(res, FA_MESSAGES.cancelFailed),
          });
          return false;
        }
        set({ cancellingId: null, cancelError: null });
        await get().fetchDashboard();
        return true;
      } catch {
        set({ cancellingId: null, cancelError: FA_MESSAGES.network });
        return false;
      }
    },
  }),
);
