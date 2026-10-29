"use client";

import { create } from "zustand";
import {
  listServicesRequest,
  createServiceRequest,
  updateServiceRequest,
  deleteServiceRequest,
} from "@/lib/api/endpoints/service.endpoints";
import type { ServiceDto, ServiceInput } from "@/features/service/types";

export type ServiceStatus = "idle" | "loading" | "loaded" | "error";

interface ServiceState {
  services: ServiceDto[];
  status: ServiceStatus;
  error: string | null;
  saving: boolean;
  removingId: number | null;
  notice: string | null;

  fetchServices: (businessId: number) => Promise<void>;
  createService: (businessId: number, input: ServiceInput) => Promise<boolean>;
  updateService: (
    businessId: number,
    serviceId: number,
    input: ServiceInput
  ) => Promise<boolean>;
  removeService: (businessId: number, serviceId: number) => Promise<boolean>;

  clearError: () => void;
  clearNotice: () => void;
  reset: () => void;
}

const FA_MESSAGES = {
  listFailed: "دریافت فهرست خدمات ممکن نشد.",
  createFailed: "ثبت خدمت انجام نشد.",
  updateFailed: "به‌روزرسانی خدمت انجام نشد.",
  deleteFailed: "حذف خدمت انجام نشد.",
  created: "خدمت جدید با موفقیت ثبت شد.",
  updated: "خدمت با موفقیت به‌روزرسانی شد.",
  removed: "خدمت با موفقیت حذف شد.",
  forbidden: "شما اجازهٔ مدیریت خدمات این کسب‌وکار را ندارید.",
  notFound: "خدمت یا کسب‌وکار مورد نظر یافت نشد.",
  network: "اتصال به سرور ممکن نیست. لطفاً دوباره تلاش کنید.",
} as const;

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const text = (await res.text()).trim().replace(/^"|"$/g, "");
    if (text && text.length < 200) {
      try {
        const json = JSON.parse(text) as { message?: string };
        if (json?.message && typeof json.message === "string") return json.message;
      } catch {
        return text;
      }
      return text;
    }
  } catch {
    // fall through
  }
  if (typeof navigator !== "undefined" && !navigator.onLine)
    return FA_MESSAGES.network;
  return fallback;
}

function statusFallback(status: number, fallback: string): string {
  if (status === 403) return FA_MESSAGES.forbidden;
  if (status === 404) return FA_MESSAGES.notFound;
  return fallback;
}

const initial = {
  services: [] as ServiceDto[],
  status: "idle" as ServiceStatus,
  error: null as string | null,
  saving: false,
  removingId: null as number | null,
  notice: null as string | null,
};

export const useServiceStore = create<ServiceState>((set) => ({
  ...initial,

  clearError: () => set({ error: null }),
  clearNotice: () => set({ notice: null }),
  reset: () => set({ ...initial }),

  fetchServices: async (businessId) => {
    set({ status: "loading", error: null });
    try {
      const res = await listServicesRequest(businessId);
      if (!res.ok) {
        set({
          status: "error",
          error: await readError(
            res,
            statusFallback(res.status, FA_MESSAGES.listFailed)
          ),
        });
        return;
      }
      const data = (await res.json()) as ServiceDto[];
      set({
        services: Array.isArray(data) ? data : [],
        status: "loaded",
      });
    } catch {
      set({ status: "error", error: FA_MESSAGES.network });
    }
  },

  createService: async (businessId, input) => {
    set({ saving: true, error: null, notice: null });
    try {
      const res = await createServiceRequest(businessId, input);
      if (!res.ok) {
        set({
          error: await readError(
            res,
            statusFallback(res.status, FA_MESSAGES.createFailed)
          ),
        });
        return false;
      }
      const service = (await res.json()) as ServiceDto;
      set((s) => ({
        services: [service, ...s.services],
        notice: FA_MESSAGES.created,
      }));
      return true;
    } catch {
      set({ error: FA_MESSAGES.network });
      return false;
    } finally {
      set({ saving: false });
    }
  },

  updateService: async (businessId, serviceId, input) => {
    set({ saving: true, error: null, notice: null });
    try {
      const res = await updateServiceRequest(businessId, serviceId, input);
      if (!res.ok) {
        set({
          error: await readError(
            res,
            statusFallback(res.status, FA_MESSAGES.updateFailed)
          ),
        });
        return false;
      }
      const service = (await res.json()) as ServiceDto;
      set((s) => ({
        services: s.services.map((item) =>
          item.id === serviceId ? service : item
        ),
        notice: FA_MESSAGES.updated,
      }));
      return true;
    } catch {
      set({ error: FA_MESSAGES.network });
      return false;
    } finally {
      set({ saving: false });
    }
  },

  removeService: async (businessId, serviceId) => {
    set({ removingId: serviceId, error: null, notice: null });
    try {
      const res = await deleteServiceRequest(businessId, serviceId);
      if (!res.ok) {
        set({
          error: await readError(
            res,
            statusFallback(res.status, FA_MESSAGES.deleteFailed)
          ),
        });
        return false;
      }
      set((s) => ({
        services: s.services.filter((item) => item.id !== serviceId),
        notice: FA_MESSAGES.removed,
      }));
      return true;
    } catch {
      set({ error: FA_MESSAGES.network });
      return false;
    } finally {
      set({ removingId: null });
    }
  },
}));
