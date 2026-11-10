import { apiClient } from "@/lib/api/client";
import type {
  BusinessFavoriteDto,
  CustomerDashboardBookingItemDto,
  CustomerDashboardDto,
  CustomerDashboardSummaryDto,
  CustomerUpcomingBookingsDto,
} from "@/features/customer/types";

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function parseSummary(raw: unknown): CustomerDashboardSummaryDto {
  const s = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  return {
    upcomingBookingsCount: asFiniteNumber(s.upcomingBookingsCount) ?? 0,
    totalBookingsCount: asFiniteNumber(s.totalBookingsCount) ?? 0,
    favoriteSalonsCount: asFiniteNumber(s.favoriteSalonsCount) ?? 0,
  };
}

function parseBookingItem(
  raw: unknown,
): CustomerDashboardBookingItemDto | null {
  if (typeof raw !== "object" || raw === null) return null;
  const item = raw as Record<string, unknown>;
  const id = asFiniteNumber(item.id);
  const status = asFiniteNumber(item.status);
  const businessId = asFiniteNumber(item.businessId);
  if (id == null || status == null || businessId == null) return null;
  if (typeof item.startTime !== "string" || typeof item.endTime !== "string") {
    return null;
  }
  if (typeof item.businessName !== "string") return null;
  if (typeof item.serviceName !== "string") return null;
  if (typeof item.employeeName !== "string") return null;
  return {
    id,
    startTime: item.startTime,
    endTime: item.endTime,
    status,
    businessId,
    businessName: item.businessName,
    businessProfileImageUrl:
      typeof item.businessProfileImageUrl === "string"
        ? item.businessProfileImageUrl
        : null,
    serviceName: item.serviceName,
    employeeName: item.employeeName,
  };
}

function parseUpcoming(raw: unknown): CustomerUpcomingBookingsDto {
  const u = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const items = Array.isArray(u.items)
    ? u.items
        .map(parseBookingItem)
        .filter((x): x is CustomerDashboardBookingItemDto => x !== null)
    : [];
  return {
    totalCount: asFiniteNumber(u.totalCount) ?? items.length,
    items,
  };
}

/** Normalize customer dashboard JSON; optional `{ data }` unwrap. */
export function parseCustomerDashboard(body: unknown): CustomerDashboardDto {
  const root =
    body && typeof body === "object" && "data" in (body as object)
      ? (body as { data: unknown }).data
      : body;
  const r = (root && typeof root === "object" ? root : {}) as Record<
    string,
    unknown
  >;
  const recent = Array.isArray(r.recentBookings)
    ? r.recentBookings
        .map(parseBookingItem)
        .filter((x): x is CustomerDashboardBookingItemDto => x !== null)
    : [];
  return {
    summary: parseSummary(r.summary),
    upcomingBookings: parseUpcoming(r.upcomingBookings),
    recentBookings: recent,
  };
}

export function parseBusinessFavorite(
  raw: unknown,
): BusinessFavoriteDto | null {
  if (typeof raw !== "object" || raw === null) return null;
  const f = raw as Record<string, unknown>;
  const businessId = asFiniteNumber(f.businessId);
  if (businessId == null) return null;
  if (typeof f.name !== "string" || typeof f.city !== "string") return null;
  if (typeof f.favoritedAt !== "string") return null;
  return {
    businessId,
    name: f.name,
    city: f.city,
    profileImageUrl:
      typeof f.profileImageUrl === "string" ? f.profileImageUrl : null,
    favoritedAt: f.favoritedAt,
  };
}

export function parseBusinessFavorites(body: unknown): BusinessFavoriteDto[] {
  const root =
    body && typeof body === "object" && "data" in (body as object)
      ? (body as { data: unknown }).data
      : body;
  if (!Array.isArray(root)) return [];
  return root
    .map(parseBusinessFavorite)
    .filter((x): x is BusinessFavoriteDto => x !== null);
}

// GET /api/customer/dashboard
export function getCustomerDashboardRequest(): Promise<Response> {
  return apiClient("/api/customer/dashboard", { cache: "no-store" });
}

// GET /api/customer/favorites
export function listCustomerFavoritesRequest(): Promise<Response> {
  return apiClient("/api/customer/favorites", { cache: "no-store" });
}

// POST /api/customer/favorites — idempotent
export function addCustomerFavoriteRequest(
  businessId: number,
): Promise<Response> {
  return apiClient("/api/customer/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessId }),
  });
}

// DELETE /api/customer/favorites/{businessId}
export function removeCustomerFavoriteRequest(
  businessId: number,
): Promise<Response> {
  return apiClient(`/api/customer/favorites/${businessId}`, {
    method: "DELETE",
  });
}
