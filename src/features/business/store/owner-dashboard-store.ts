"use client";

import { create } from "zustand";
import {
  getBusinessDashboardRequest,
  parseBusinessDashboard,
} from "@/lib/api/endpoints/business.endpoints";
import type { BusinessDashboardDto } from "@/features/business/types";

export type OwnerDashboardStatus =
  | "idle"
  | "loading"
  | "loaded"
  | "forbidden"
  | "notFound"
  | "error";

interface OwnerDashboardState {
  data: BusinessDashboardDto | null;
  status: OwnerDashboardStatus;
  error: string | null;
  fetchDashboard: () => Promise<void>;
  clearError: () => void;
}

const FA_MESSAGES = {
  fetchFailed: "دریافت داشبورد ممکن نشد.",
  forbidden: "شما اجازهٔ مشاهدهٔ داشبورد مدیریت سالن را ندارید.",
  notFound: "هنوز سالنی برای حساب شما ثبت نشده است.",
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

export const useOwnerDashboardStore = create<OwnerDashboardState>((set) => ({
  data: null,
  status: "idle",
  error: null,

  clearError: () => set({ error: null }),

  fetchDashboard: async () => {
    const seq = ++requestSeq;
    set({ status: "loading", error: null });
    try {
      const res = await getBusinessDashboardRequest();
      if (seq !== requestSeq) return;

      if (res.status === 401) {
        // apiClient already handles session expiry redirect.
        set({ status: "error", error: FA_MESSAGES.fetchFailed, data: null });
        return;
      }
      if (res.status === 403) {
        set({ status: "forbidden", error: FA_MESSAGES.forbidden, data: null });
        return;
      }
      if (res.status === 404) {
        set({ status: "notFound", error: FA_MESSAGES.notFound, data: null });
        return;
      }
      if (res.status === 400) {
        set({
          status: "error",
          error: await readError(res, FA_MESSAGES.fetchFailed),
          data: null,
        });
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
        data: parseBusinessDashboard(body),
        status: "loaded",
        error: null,
      });
    } catch {
      if (seq !== requestSeq) return;
      set({ status: "error", error: FA_MESSAGES.network, data: null });
    }
  },
}));
