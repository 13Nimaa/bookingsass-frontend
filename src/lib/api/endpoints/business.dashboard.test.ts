import { describe, expect, it } from "vitest";
import { parseBusinessDashboard } from "./business.endpoints";

describe("parseBusinessDashboard", () => {
  it("parses a full payload and keeps weeklyRevenue order", () => {
    const parsed = parseBusinessDashboard({
      summary: {
        todayBookingsCount: 4,
        todayEstimatedRevenue: 2480000,
        customerCount: 128,
      },
      capacity: {
        utilizationPercent: 85,
        occupiedMinutes: 340,
        availableMinutes: 400,
      },
      weeklyRevenue: [
        {
          date: "2026-11-01",
          dayOfWeek: 6,
          weekdayKey: "saturday",
          estimatedRevenue: 100,
          completedBookingCount: 1,
        },
        {
          date: "2026-11-02",
          dayOfWeek: 0,
          weekdayKey: "sunday",
          estimatedRevenue: 0,
          completedBookingCount: 0,
        },
      ],
      todayBookings: {
        totalCount: 9,
        items: [
          {
            id: 1,
            customerName: null,
            serviceTitle: "اصلاح مو",
            employeeName: "علی",
            startTime: "2026-11-07T07:00:00Z",
            endTime: "2026-11-07T07:30:00Z",
            status: 1,
            price: 200000,
          },
        ],
      },
      topServices: {
        periodStart: "2026-11-01",
        periodEnd: "2026-11-30",
        items: [
          {
            serviceId: 3,
            title: "اصلاح مو",
            bookingCount: 42,
            percentage: 82,
          },
        ],
      },
    });

    expect(parsed.summary.todayEstimatedRevenue).toBe(2480000);
    expect(parsed.capacity?.utilizationPercent).toBe(85);
    expect(parsed.weeklyRevenue.map((p) => p.weekdayKey)).toEqual([
      "saturday",
      "sunday",
    ]);
    expect(parsed.todayBookings.totalCount).toBe(9);
    expect(parsed.todayBookings.items[0]?.customerName).toBeNull();
    expect(parsed.topServices.items[0]?.percentage).toBe(82);
  });

  it("treats null revenue and null capacity as unavailable, not zero", () => {
    const parsed = parseBusinessDashboard({
      summary: {
        todayBookingsCount: 0,
        todayEstimatedRevenue: null,
        customerCount: 0,
      },
      capacity: null,
      weeklyRevenue: [],
      todayBookings: { totalCount: 0, items: [] },
      topServices: { periodStart: "", periodEnd: "", items: [] },
    });

    expect(parsed.summary.todayEstimatedRevenue).toBeNull();
    expect(parsed.capacity).toBeNull();
  });

  it("unwraps { data } envelopes", () => {
    const parsed = parseBusinessDashboard({
      data: {
        summary: {
          todayBookingsCount: 2,
          todayEstimatedRevenue: null,
          customerCount: 1,
        },
        capacity: { utilizationPercent: null },
        weeklyRevenue: [],
        todayBookings: { totalCount: 0, items: [] },
        topServices: { periodStart: "", periodEnd: "", items: [] },
      },
    });

    expect(parsed.summary.todayBookingsCount).toBe(2);
    expect(parsed.capacity?.utilizationPercent).toBeNull();
  });
});
