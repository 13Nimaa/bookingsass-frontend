"use client";

import { create } from "zustand";
import { listBookingsRequest } from "@/lib/api/endpoints/booking.endpoints";
import type {
  BookingListItem,
  ListBookingsParams,
  PagedBookings,
} from "@/features/booking/types";

export type BookingListStatus = "idle" | "loading" | "loaded" | "error";

interface BookingState {
  bookings: BookingListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  status: BookingListStatus;
  error: string | null;

  fetchBookings: (params?: ListBookingsParams) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const FA_MESSAGES = {
  listFailed: "دریافت فهرست رزروها ممکن نشد.",
  forbidden: "شما اجازهٔ مشاهدهٔ رزروهای این سالن را ندارید.",
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
  return fallback;
}

function normalizePrice(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function normalizeListItem(raw: unknown): BookingListItem | null {
  if (typeof raw !== "object" || raw === null) return null;
  const item = raw as Record<string, unknown>;
  if (typeof item.id !== "number") return null;
  if (typeof item.startTime !== "string" || typeof item.endTime !== "string") {
    return null;
  }
  if (typeof item.status !== "number") return null;
  if (typeof item.customerName !== "string") return null;
  if (typeof item.serviceName !== "string") return null;
  if (typeof item.employeeName !== "string") return null;
  if (typeof item.businessId !== "number") return null;

  return {
    id: item.id,
    startTime: item.startTime,
    endTime: item.endTime,
    status: item.status as BookingListItem["status"],
    creatorType: (typeof item.creatorType === "number"
      ? item.creatorType
      : 0) as BookingListItem["creatorType"],
    customerName: item.customerName,
    customerPhone:
      typeof item.customerPhone === "string" ? item.customerPhone : null,
    serviceName: item.serviceName,
    serviceDurationMinutes:
      typeof item.serviceDurationMinutes === "number"
        ? item.serviceDurationMinutes
        : 0,
    employeeName: item.employeeName,
    businessId: item.businessId,
    price: normalizePrice(item.price),
  };
}

function isPagedBookings(data: unknown): data is PagedBookings {
  return (
    typeof data === "object" &&
    data !== null &&
    Array.isArray((data as PagedBookings).items)
  );
}

const initial = {
  bookings: [] as BookingListItem[],
  page: 1,
  pageSize: 20,
  totalCount: 0,
  totalPages: 0,
  status: "idle" as BookingListStatus,
  error: null as string | null,
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initial,

  clearError: () => set({ error: null }),
  reset: () => set({ ...initial }),

  fetchBookings: async (params) => {
    set({ status: "loading", error: null });
    try {
      const res = await listBookingsRequest(params);
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
      if (!isPagedBookings(data)) {
        set({ status: "error", error: FA_MESSAGES.listFailed });
        return;
      }
      const items = data.items
        .map(normalizeListItem)
        .filter((item): item is BookingListItem => item != null);
      set({
        bookings: items,
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
}));
