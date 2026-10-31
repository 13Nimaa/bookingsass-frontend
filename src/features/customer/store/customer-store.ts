"use client";

import { create } from "zustand";
import {
  listCustomersRequest,
  createCustomerRequest,
  updateCustomerRequest,
  deleteCustomerRequest,
} from "@/lib/api/endpoints/customer.endpoints";
import type {
  CreateCustomerInput,
  CustomerDto,
  ListCustomersParams,
  PagedCustomers,
  UpdateCustomerInput,
} from "@/features/customer/types";

export type CustomerStatus = "idle" | "loading" | "loaded" | "error";

interface CustomerState {
  customers: CustomerDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  status: CustomerStatus;
  error: string | null;
  saving: boolean;
  removingId: number | null;
  notice: string | null;

  fetchCustomers: (
    businessId: number,
    params?: ListCustomersParams,
  ) => Promise<void>;
  createCustomer: (
    businessId: number,
    input: CreateCustomerInput,
  ) => Promise<boolean>;
  updateCustomer: (
    businessId: number,
    customerId: number,
    input: UpdateCustomerInput,
  ) => Promise<boolean>;
  removeCustomer: (businessId: number, customerId: number) => Promise<boolean>;

  clearError: () => void;
  clearNotice: () => void;
  reset: () => void;
}

const FA_MESSAGES = {
  listFailed: "دریافت فهرست مشتریان ممکن نشد.",
  createFailed: "ثبت مشتری انجام نشد.",
  updateFailed: "به‌روزرسانی مشتری انجام نشد.",
  deleteFailed: "حذف مشتری انجام نشد.",
  created: "مشتری با موفقیت اضافه شد",
  updated: "اطلاعات مشتری با موفقیت ویرایش شد",
  removed: "مشتری با موفقیت حذف شد",
  forbidden: "شما اجازهٔ مدیریت مشتریان این کسب‌وکار را ندارید.",
  notFound: "مشتری یا کسب‌وکار مورد نظر یافت نشد.",
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

function statusFallback(status: number, fallback: string): string {
  if (status === 403) return FA_MESSAGES.forbidden;
  if (status === 404) return FA_MESSAGES.notFound;
  return fallback;
}

function isPagedCustomers(data: unknown): data is PagedCustomers {
  return (
    typeof data === "object" &&
    data !== null &&
    Array.isArray((data as PagedCustomers).items)
  );
}

const initial = {
  customers: [] as CustomerDto[],
  page: 1,
  pageSize: 20,
  totalCount: 0,
  totalPages: 0,
  status: "idle" as CustomerStatus,
  error: null as string | null,
  saving: false,
  removingId: null as number | null,
  notice: null as string | null,
};

export const useCustomerStore = create<CustomerState>((set) => ({
  ...initial,

  clearError: () => set({ error: null }),
  clearNotice: () => set({ notice: null }),
  reset: () => set({ ...initial }),

  fetchCustomers: async (businessId, params) => {
    set({ status: "loading", error: null });
    try {
      const res = await listCustomersRequest(businessId, params);
      if (!res.ok) {
        set({
          status: "error",
          error: await readError(
            res,
            statusFallback(res.status, FA_MESSAGES.listFailed),
          ),
        });
        return;
      }
      const data: unknown = await res.json();
      if (!isPagedCustomers(data)) {
        set({ status: "error", error: FA_MESSAGES.listFailed });
        return;
      }
      set({
        customers: data.items,
        page: data.page,
        pageSize: data.pageSize,
        totalCount: data.totalCount,
        totalPages: data.totalPages,
        status: "loaded",
      });
    } catch {
      set({ status: "error", error: FA_MESSAGES.network });
    }
  },

  createCustomer: async (businessId, input) => {
    set({ saving: true, error: null, notice: null });
    try {
      const res = await createCustomerRequest(businessId, input);
      if (!res.ok) {
        set({
          error: await readError(
            res,
            statusFallback(res.status, FA_MESSAGES.createFailed),
          ),
        });
        return false;
      }
      set({ notice: FA_MESSAGES.created });
      return true;
    } catch {
      set({ error: FA_MESSAGES.network });
      return false;
    } finally {
      set({ saving: false });
    }
  },

  updateCustomer: async (businessId, customerId, input) => {
    set({ saving: true, error: null, notice: null });
    try {
      const res = await updateCustomerRequest(businessId, customerId, input);
      if (!res.ok) {
        set({
          error: await readError(
            res,
            statusFallback(res.status, FA_MESSAGES.updateFailed),
          ),
        });
        return false;
      }
      const customer = (await res.json()) as CustomerDto;
      set((s) => ({
        customers: s.customers.map((item) =>
          item.id === customerId ? customer : item,
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

  removeCustomer: async (businessId, customerId) => {
    set({ removingId: customerId, error: null, notice: null });
    try {
      const res = await deleteCustomerRequest(businessId, customerId);
      if (!res.ok) {
        set({
          error: await readError(
            res,
            statusFallback(res.status, FA_MESSAGES.deleteFailed),
          ),
        });
        return false;
      }
      // Soft-delete: mark inactive locally; caller should refetch for paging.
      set((s) => ({
        customers: s.customers.map((item) =>
          item.id === customerId ? { ...item, isActive: false } : item,
        ),
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
