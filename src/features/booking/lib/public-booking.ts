import {
  createBookingRequest,
  createGuestBookingRequest,
  getAvailabilityRequest,
} from "@/lib/api/endpoints/booking.endpoints";
import type {
  AvailabilitySlot,
  BookingDto,
  CreateBookingInput,
  CreateGuestBookingInput,
} from "@/features/booking/types";

const FA = {
  network: "اتصال به سرور ممکن نیست. لطفاً دوباره تلاش کنید.",
  availabilityFailed: "دریافت ساعات آزاد ممکن نشد.",
  createFailed: "ثبت رزرو انجام نشد. لطفاً دوباره تلاش کنید.",
  unauthorized: "برای رزرو وارد حساب کاربری شوید یا به‌عنوان مهمان ادامه دهید.",
} as const;

export async function readApiError(
  res: Response,
  fallback: string,
): Promise<string> {
  try {
    const text = await res.text();
    if (!text.trim()) return fallback;
    try {
      const data = JSON.parse(text) as {
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
      if (typeof data?.title === "string" && data.title.trim()) {
        return data.title;
      }
    } catch {
      if (text.trim()) return text.trim();
    }
  } catch {
    // fall through
  }
  if (typeof navigator !== "undefined" && !navigator.onLine) return FA.network;
  return fallback;
}

export async function fetchAvailabilitySlots(params: {
  businessId: number;
  serviceId: number;
  employeeId: number;
  date: string;
}): Promise<{ slots: AvailabilitySlot[]; error: string | null }> {
  try {
    const res = await getAvailabilityRequest(params);
    if (!res.ok) {
      return {
        slots: [],
        error: await readApiError(res, FA.availabilityFailed),
      };
    }
    const body = (await res.json()) as unknown;
    if (!Array.isArray(body)) {
      return { slots: [], error: FA.availabilityFailed };
    }
    const slots: AvailabilitySlot[] = [];
    for (const raw of body) {
      if (typeof raw !== "object" || raw === null) continue;
      const item = raw as Record<string, unknown>;
      if (typeof item.startTime !== "string" || typeof item.endTime !== "string") {
        continue;
      }
      slots.push({ startTime: item.startTime, endTime: item.endTime });
    }
    return { slots, error: null };
  } catch {
    return { slots: [], error: FA.network };
  }
}

function parseBookingDto(raw: unknown): BookingDto | null {
  if (typeof raw !== "object" || raw === null) return null;
  const item = raw as Record<string, unknown>;
  if (typeof item.id !== "number") return null;
  if (typeof item.businessId !== "number") return null;
  if (typeof item.serviceId !== "number") return null;
  if (typeof item.employeeId !== "number") return null;
  if (typeof item.startTime !== "string" || typeof item.endTime !== "string") {
    return null;
  }
  if (typeof item.status !== "number") return null;
  if (typeof item.creatorType !== "number") return null;
  if (typeof item.createdAt !== "string") return null;
  return {
    id: item.id,
    businessId: item.businessId,
    customerId: typeof item.customerId === "number" ? item.customerId : 0,
    serviceId: item.serviceId,
    employeeId: item.employeeId,
    startTime: item.startTime,
    endTime: item.endTime,
    notes: typeof item.notes === "string" ? item.notes : null,
    status: item.status as BookingDto["status"],
    creatorType: item.creatorType as BookingDto["creatorType"],
    createdByUserId:
      typeof item.createdByUserId === "string" ? item.createdByUserId : null,
    createdAt: item.createdAt,
    price:
      typeof item.price === "number" && Number.isFinite(item.price)
        ? item.price
        : null,
  };
}

export async function submitAuthenticatedBooking(
  input: CreateBookingInput,
): Promise<{ booking: BookingDto | null; error: string | null }> {
  try {
    const res = await createBookingRequest(input);
    if (res.status === 401) {
      return { booking: null, error: FA.unauthorized };
    }
    if (!res.ok) {
      return { booking: null, error: await readApiError(res, FA.createFailed) };
    }
    const body = (await res.json()) as unknown;
    const booking = parseBookingDto(body);
    if (!booking) {
      return { booking: null, error: FA.createFailed };
    }
    return { booking, error: null };
  } catch {
    return { booking: null, error: FA.network };
  }
}

export async function submitGuestBooking(
  input: CreateGuestBookingInput,
): Promise<{ booking: BookingDto | null; error: string | null }> {
  try {
    const res = await createGuestBookingRequest(input);
    if (!res.ok) {
      return { booking: null, error: await readApiError(res, FA.createFailed) };
    }
    const body = (await res.json()) as unknown;
    const booking = parseBookingDto(body);
    if (!booking) {
      return { booking: null, error: FA.createFailed };
    }
    return { booking, error: null };
  } catch {
    return { booking: null, error: FA.network };
  }
}

/** Convert an availability slot start to UTC ISO for create payloads. */
export function slotStartToUtcIso(slotStart: string): string {
  return new Date(slotStart).toISOString();
}

/** Placeholder endTime — server recalculates from effective duration. */
export function placeholderEndUtcIso(slotStart: string, durationMinutes: number): string {
  const startMs = new Date(slotStart).getTime();
  return new Date(startMs + durationMinutes * 60_000).toISOString();
}
