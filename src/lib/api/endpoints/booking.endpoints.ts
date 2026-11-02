import { apiClient } from "@/lib/api/client";
import { backendFetch } from "@/lib/api/http";
import type {
  AvailabilityParams,
  CreateBookingInput,
  CreateGuestBookingInput,
  ListBookingsParams,
  ListMyBookingsParams,
  UpdateBookingStatusInput,
} from "@/features/booking/types";

function toQuery(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    q.set(key, String(value));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

// GET /api/bookings/availability — anonymous OK
export function getAvailabilityRequest(
  params: AvailabilityParams
): Promise<Response> {
  return backendFetch(
    `/api/bookings/availability${toQuery({
      businessId: params.businessId,
      serviceId: params.serviceId,
      employeeId: params.employeeId,
      date: params.date,
    })}`
  );
}

// POST /api/bookings — authenticated customer (customerId from JWT)
export function createBookingRequest(
  input: CreateBookingInput
): Promise<Response> {
  return apiClient("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

// POST /api/bookings/guest — anonymous
export function createGuestBookingRequest(
  input: CreateGuestBookingInput
): Promise<Response> {
  return backendFetch("/api/bookings/guest", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// GET /api/bookings — owner / employee (scoped)
export function listBookingsRequest(
  params?: ListBookingsParams
): Promise<Response> {
  return apiClient(`/api/bookings${toQuery({ ...params })}`);
}

// GET /api/bookings/mine — authenticated user's Customer-linked history
export function listMyBookingsRequest(
  params?: ListMyBookingsParams
): Promise<Response> {
  return apiClient(`/api/bookings/mine${toQuery({ ...params })}`);
}

// GET /api/bookings/:bookingId — owner / employee (scoped)
export function getBookingRequest(bookingId: number): Promise<Response> {
  return apiClient(`/api/bookings/${bookingId}`);
}

// PATCH /api/bookings/:bookingId/status — BusinessOwner only
export function updateBookingStatusRequest(
  bookingId: number,
  input: UpdateBookingStatusInput
): Promise<Response> {
  return apiClient(`/api/bookings/${bookingId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
