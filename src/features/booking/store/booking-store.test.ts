import { beforeEach, describe, expect, it, vi } from "vitest";
import { BookingStatus } from "@/features/booking/types";
import { useBookingStore } from "@/features/booking/store/booking-store";

vi.mock("@/lib/api/endpoints/booking.endpoints", () => ({
  listBookingsRequest: vi.fn(),
}));

import { listBookingsRequest } from "@/lib/api/endpoints/booking.endpoints";

const listMock = vi.mocked(listBookingsRequest);

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("useBookingStore.fetchBookings", () => {
  beforeEach(() => {
    useBookingStore.getState().reset();
    listMock.mockReset();
  });

  it("loads paged bookings and normalizes missing price to null", async () => {
    listMock.mockResolvedValue(
      jsonResponse({
        items: [
          {
            id: 1,
            startTime: "2026-11-10T06:30:00Z",
            endTime: "2026-11-10T07:00:00Z",
            status: BookingStatus.Pending,
            creatorType: 1,
            customerName: "سارا",
            customerPhone: "09121234567",
            serviceName: "کوتاهی",
            serviceDurationMinutes: 30,
            employeeName: "مینا",
            businessId: 9,
          },
          {
            id: 2,
            startTime: "2026-11-11T06:30:00Z",
            endTime: "2026-11-11T07:15:00Z",
            status: BookingStatus.Confirmed,
            creatorType: 0,
            customerName: "علی",
            customerPhone: null,
            serviceName: "رنگ",
            serviceDurationMinutes: 45,
            employeeName: "مینا",
            businessId: 9,
            price: 350000,
          },
        ],
        page: 1,
        pageSize: 20,
        totalCount: 2,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      }),
    );

    await useBookingStore.getState().fetchBookings({ page: 1, pageSize: 20 });

    const state = useBookingStore.getState();
    expect(state.status).toBe("loaded");
    expect(state.totalCount).toBe(2);
    expect(state.bookings[0]?.price).toBeNull();
    expect(state.bookings[1]?.price).toBe(350000);
    expect(listMock).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
  });

  it("surfaces forbidden errors with Persian fallback", async () => {
    listMock.mockResolvedValue(new Response(null, { status: 403 }));

    await useBookingStore.getState().fetchBookings();

    const state = useBookingStore.getState();
    expect(state.status).toBe("error");
    expect(state.error).toContain("اجازه");
    expect(state.bookings).toEqual([]);
  });
});
