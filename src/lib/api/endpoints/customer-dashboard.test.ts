import { describe, expect, it } from "vitest";
import {
  parseBusinessFavorites,
  parseCustomerDashboard,
} from "./customer-dashboard.endpoints";

describe("parseCustomerDashboard", () => {
  it("parses a full payload", () => {
    const parsed = parseCustomerDashboard({
      summary: {
        upcomingBookingsCount: 2,
        totalBookingsCount: 12,
        favoriteSalonsCount: 3,
      },
      upcomingBookings: {
        totalCount: 7,
        items: [
          {
            id: 10,
            startTime: "2026-11-10T12:00:00Z",
            endTime: "2026-11-10T12:45:00Z",
            status: 1,
            businessId: 4,
            businessName: "سالن رزینا",
            businessProfileImageUrl: "https://cdn.example/a.jpg",
            serviceName: "کوتاهی",
            employeeName: "مینا",
          },
        ],
      },
      recentBookings: [
        {
          id: 9,
          startTime: "2026-11-01T10:00:00Z",
          endTime: "2026-11-01T10:30:00Z",
          status: 3,
          businessId: 4,
          businessName: "سالن رزینا",
          businessProfileImageUrl: null,
          serviceName: "ابرو",
          employeeName: "سارا",
        },
      ],
    });

    expect(parsed.summary.upcomingBookingsCount).toBe(2);
    expect(parsed.summary.favoriteSalonsCount).toBe(3);
    expect(parsed.upcomingBookings.totalCount).toBe(7);
    expect(parsed.upcomingBookings.items[0]?.businessName).toBe("سالن رزینا");
    expect(parsed.recentBookings[0]?.businessProfileImageUrl).toBeNull();
    expect(parsed.recentBookings[0]?.status).toBe(3);
  });

  it("unwraps { data } and drops invalid booking rows", () => {
    const parsed = parseCustomerDashboard({
      data: {
        summary: {},
        upcomingBookings: {
          totalCount: "2",
          items: [
            { id: 1 },
            {
              id: 2,
              startTime: "2026-11-10T12:00:00Z",
              endTime: "2026-11-10T12:45:00Z",
              status: 0,
              businessId: 1,
              businessName: "A",
              businessProfileImageUrl: null,
              serviceName: "S",
              employeeName: "E",
            },
          ],
        },
        recentBookings: null,
      },
    });

    expect(parsed.summary.totalBookingsCount).toBe(0);
    expect(parsed.upcomingBookings.totalCount).toBe(2);
    expect(parsed.upcomingBookings.items).toHaveLength(1);
    expect(parsed.upcomingBookings.items[0]?.id).toBe(2);
    expect(parsed.recentBookings).toEqual([]);
  });
});

describe("parseBusinessFavorites", () => {
  it("parses a favorites array", () => {
    const parsed = parseBusinessFavorites([
      {
        businessId: 1,
        name: "سالن آ",
        city: "تهران",
        profileImageUrl: null,
        favoritedAt: "2026-11-01T08:00:00Z",
      },
      { businessId: "bad" },
    ]);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.name).toBe("سالن آ");
  });
});
