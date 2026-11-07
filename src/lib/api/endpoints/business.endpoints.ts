import { apiClient } from "@/lib/api/client";
import { backendFetch } from "@/lib/api/http";
import type {
  BusinessDashboardCapacityDto,
  BusinessDashboardDto,
  BusinessDashboardSummaryDto,
  BusinessDetailsDto,
  BusinessDto,
  BusinessGalleryImageDto,
  BusinessInput,
  BusinessListQuery,
  DashboardTodayBookingItemDto,
  DashboardTodayBookingsDto,
  DashboardTopServiceItemDto,
  DashboardTopServicesDto,
  PagedBusinesses,
  PublicEmployeeDto,
  PublicEmployeeServiceDto,
  PublicWorkingHourDto,
  WeeklyRevenuePointDto,
} from "@/features/business/types";

// Direct backend calls — no Next.js BFF in between.
// listBusinesses is server-safe (public, no token). The authenticated calls
// go through apiClient, which attaches the in-memory access token and
// retries once after a single-flight token refresh on 401.

function toQuery(
  params: Record<string, string | number | boolean | undefined | null>,
): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    q.set(key, String(value));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const EMPTY_BUSINESS_PAGE: PagedBusinesses = {
  items: [],
  page: 1,
  pageSize: 20,
  totalCount: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

// GET /api/business — public paged list (search / city / sort / page).
// Documented exception: returns `{ data, failed }` instead of raw Response
// so the server page can render without try/catch at the call site.
export async function listBusinesses(
  query: BusinessListQuery = {},
): Promise<{
  data: PagedBusinesses;
  failed: boolean;
}> {
  try {
    const res = await backendFetch(
      `/api/business${toQuery({
        search: query.search,
        city: query.city,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        page: query.page,
        pageSize: query.pageSize,
      })}`,
      { cache: "no-store" },
    );
    if (!res.ok) return { data: EMPTY_BUSINESS_PAGE, failed: true };
    const body = (await res.json()) as PagedBusinesses;
    return {
      data: {
        items: Array.isArray(body.items) ? body.items : [],
        page: body.page ?? query.page ?? 1,
        pageSize: body.pageSize ?? query.pageSize ?? 20,
        totalCount: body.totalCount ?? 0,
        totalPages: body.totalPages ?? 0,
        hasPreviousPage: Boolean(body.hasPreviousPage),
        hasNextPage: Boolean(body.hasNextPage),
      },
      failed: false,
    };
  } catch {
    return { data: EMPTY_BUSINESS_PAGE, failed: true };
  }
}

export function parseBusinessGallery(
  raw: unknown,
): BusinessGalleryImageDto[] {
  if (!Array.isArray(raw)) return [];
  const out: BusinessGalleryImageDto[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const row = item as Record<string, unknown>;
    if (typeof row.url !== "string" || typeof row.publicId !== "string") continue;
    if (!row.url || !row.publicId) continue;
    out.push({ url: row.url, publicId: row.publicId });
  }
  return out;
}

function parsePublicEmployeeService(
  raw: unknown,
): PublicEmployeeServiceDto | null {
  if (typeof raw !== "object" || raw === null) return null;
  const item = raw as Record<string, unknown>;
  if (typeof item.id !== "number") return null;
  if (typeof item.title !== "string") return null;
  if (typeof item.effectivePrice !== "number") return null;
  if (typeof item.effectiveDurationMinutes !== "number") return null;
  return {
    id: item.id,
    title: item.title,
    effectivePrice: item.effectivePrice,
    effectiveDurationMinutes: item.effectiveDurationMinutes,
  };
}

function parsePublicWorkingHour(raw: unknown): PublicWorkingHourDto | null {
  if (typeof raw !== "object" || raw === null) return null;
  const item = raw as Record<string, unknown>;
  if (typeof item.id !== "number") return null;
  if (typeof item.employeeId !== "number") return null;
  if (typeof item.date !== "string") return null;
  if (typeof item.dayOfWeek !== "number") return null;
  if (typeof item.startTime !== "string") return null;
  if (typeof item.endTime !== "string") return null;
  return {
    id: item.id,
    employeeId: item.employeeId,
    date: item.date,
    dayOfWeek: item.dayOfWeek,
    startTime: item.startTime,
    endTime: item.endTime,
  };
}

function parsePublicEmployee(raw: unknown): PublicEmployeeDto | null {
  if (typeof raw !== "object" || raw === null) return null;
  const item = raw as Record<string, unknown>;
  if (typeof item.id !== "number") return null;
  if (typeof item.fullName !== "string") return null;
  const services = Array.isArray(item.services)
    ? item.services
        .map(parsePublicEmployeeService)
        .filter((s): s is PublicEmployeeServiceDto => s !== null)
    : [];
  const workingHours = Array.isArray(item.workingHours)
    ? item.workingHours
        .map(parsePublicWorkingHour)
        .filter((h): h is PublicWorkingHourDto => h !== null)
    : [];
  return {
    id: item.id,
    fullName: item.fullName,
    avatarUrl: typeof item.avatarUrl === "string" ? item.avatarUrl : null,
    services,
    workingHours,
  };
}

// GET /api/business/:id — public salon detail (no auth).
// Nested employees include services (effective pricing) + working hours.
// Documented exception: returns `{ data, notFound, failed }` so the server
// page can branch without try/catch at the call site.
export async function getBusinessById(id: number): Promise<{
  data: BusinessDetailsDto | null;
  notFound: boolean;
  failed: boolean;
}> {
  if (!Number.isFinite(id) || id <= 0) {
    return { data: null, notFound: true, failed: false };
  }
  try {
    const res = await backendFetch(`/api/business/${id}`, {
      cache: "no-store",
    });
    if (res.status === 404) {
      return { data: null, notFound: true, failed: false };
    }
    if (!res.ok) {
      return { data: null, notFound: false, failed: true };
    }
    const body = (await res.json()) as BusinessDto & {
      employees?: unknown;
    };
    if (typeof body?.id !== "number" || typeof body?.name !== "string") {
      return { data: null, notFound: false, failed: true };
    }
    const employees = Array.isArray(body.employees)
      ? body.employees
          .map(parsePublicEmployee)
          .filter((e): e is PublicEmployeeDto => e !== null)
      : [];
    return {
      data: {
        id: body.id,
        name: body.name,
        city: body.city ?? "",
        address: body.address ?? "",
        description: body.description ?? null,
        profileImageUrl: body.profileImageUrl ?? null,
        ownerId: body.ownerId ?? "",
        businessGallery: parseBusinessGallery(body.businessGallery),
        coverImageUrl: body.coverImageUrl ?? null,
        ownerAvatarUrl: body.ownerAvatarUrl ?? null,
        neighborhood: body.neighborhood ?? null,
        rating: body.rating ?? null,
        reviewCount: body.reviewCount ?? null,
        isOpen: body.isOpen ?? null,
        startingPrice: body.startingPrice ?? null,
        services: body.services ?? null,
        genderAudience: body.genderAudience ?? null,
        employees,
      },
      notFound: false,
      failed: false,
    };
  } catch {
    return { data: null, notFound: false, failed: true };
  }
}

// GET /api/business/mine — the current user's business, if any.
export function getMineBusiness(): Promise<Response> {
  return apiClient("/api/business/mine");
}

// POST /api/business — create a business for the current user.
export function createBusinessRequest(input: BusinessInput): Promise<Response> {
  return apiClient("/api/business", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

// PUT /api/business/:id — update an owned business.
export function updateBusinessRequest(
  id: number,
  input: BusinessInput,
): Promise<Response> {
  return apiClient(`/api/business/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

// POST /api/Business/register — post-registration creation. The backend
// upgrades the user to BusinessOwner and rotates tokens (note the exact
// backend casing). The response carries the new session — the caller must
// apply it to the auth store because the old tokens are rotated out.
export function registerBusinessRequest(
  input: BusinessInput,
): Promise<Response> {
  return apiClient("/api/Business/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

// POST /api/business/image — multipart upload of the owned business's image.
// Do NOT set Content-Type; the browser adds the boundary. Backend accepts
// jpg/png/webp <= 5MB. Requires an existing owned business — only call this
// after the business has been created.
export function uploadBusinessImageRequest(file: File): Promise<Response> {
  const form = new FormData();
  form.append("file", file);
  return apiClient("/api/business/image", {
    method: "POST",
    body: form,
  });
}

// DELETE /api/business/image — remove the owned business's image.
export function deleteBusinessImageRequest(): Promise<Response> {
  return apiClient("/api/business/image", { method: "DELETE" });
}

// POST /api/business/gallery — append one or more images. Form field must be
// `files` (repeat per file). Cap is 10 total on the business. Do NOT set
// Content-Type; the browser adds the multipart boundary.
export function uploadBusinessGalleryRequest(files: File[]): Promise<Response> {
  const form = new FormData();
  for (const file of files) form.append("files", file);
  return apiClient("/api/business/gallery", {
    method: "POST",
    body: form,
  });
}

// DELETE /api/business/gallery?publicId= — remove one gallery image.
export function deleteBusinessGalleryImageRequest(
  publicId: string,
): Promise<Response> {
  const qs = new URLSearchParams({ publicId });
  return apiClient(`/api/business/gallery?${qs}`, { method: "DELETE" });
}

// GET /api/Business/dashboard — BusinessOwner analytics (business from JWT).
// Exact backend casing. Always fresh — no cache.
export function getBusinessDashboardRequest(): Promise<Response> {
  return apiClient("/api/Business/dashboard", { cache: "no-store" });
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function parseSummary(raw: unknown): BusinessDashboardSummaryDto {
  const s = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  return {
    todayBookingsCount: asFiniteNumber(s.todayBookingsCount) ?? 0,
    todayEstimatedRevenue: asFiniteNumber(s.todayEstimatedRevenue),
    customerCount: asFiniteNumber(s.customerCount) ?? 0,
  };
}

function parseCapacity(raw: unknown): BusinessDashboardCapacityDto | null {
  if (raw == null) return null;
  if (typeof raw !== "object") return null;
  const c = raw as Record<string, unknown>;
  return {
    utilizationPercent: asFiniteNumber(c.utilizationPercent),
    occupiedMinutes: asFiniteNumber(c.occupiedMinutes),
    availableMinutes: asFiniteNumber(c.availableMinutes),
  };
}

function parseWeeklyPoint(raw: unknown): WeeklyRevenuePointDto | null {
  if (typeof raw !== "object" || raw === null) return null;
  const p = raw as Record<string, unknown>;
  const estimatedRevenue = asFiniteNumber(p.estimatedRevenue);
  const completedBookingCount = asFiniteNumber(p.completedBookingCount);
  if (estimatedRevenue == null || completedBookingCount == null) return null;
  if (typeof p.date !== "string" || typeof p.weekdayKey !== "string") return null;
  return {
    date: p.date,
    dayOfWeek: asFiniteNumber(p.dayOfWeek) ?? 0,
    weekdayKey: p.weekdayKey,
    estimatedRevenue,
    completedBookingCount,
  };
}

function parseTodayItem(raw: unknown): DashboardTodayBookingItemDto | null {
  if (typeof raw !== "object" || raw === null) return null;
  const item = raw as Record<string, unknown>;
  const id = asFiniteNumber(item.id);
  const status = asFiniteNumber(item.status);
  if (id == null || status == null) return null;
  if (typeof item.startTime !== "string" || typeof item.endTime !== "string") {
    return null;
  }
  if (typeof item.serviceTitle !== "string") return null;
  if (typeof item.employeeName !== "string") return null;
  return {
    id,
    customerName:
      typeof item.customerName === "string" ? item.customerName : null,
    serviceTitle: item.serviceTitle,
    employeeName: item.employeeName,
    startTime: item.startTime,
    endTime: item.endTime,
    status,
    price: asFiniteNumber(item.price),
  };
}

function parseTodayBookings(raw: unknown): DashboardTodayBookingsDto {
  const t = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const items = Array.isArray(t.items)
    ? t.items
        .map(parseTodayItem)
        .filter((x): x is DashboardTodayBookingItemDto => x !== null)
    : [];
  return {
    totalCount: asFiniteNumber(t.totalCount) ?? items.length,
    items,
  };
}

function parseTopServiceItem(raw: unknown): DashboardTopServiceItemDto | null {
  if (typeof raw !== "object" || raw === null) return null;
  const s = raw as Record<string, unknown>;
  const serviceId = asFiniteNumber(s.serviceId);
  const bookingCount = asFiniteNumber(s.bookingCount);
  const percentage = asFiniteNumber(s.percentage);
  if (serviceId == null || bookingCount == null || percentage == null) {
    return null;
  }
  if (typeof s.title !== "string") return null;
  return { serviceId, title: s.title, bookingCount, percentage };
}

function parseTopServices(raw: unknown): DashboardTopServicesDto {
  const t = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const items = Array.isArray(t.items)
    ? t.items
        .map(parseTopServiceItem)
        .filter((x): x is DashboardTopServiceItemDto => x !== null)
    : [];
  return {
    periodStart: typeof t.periodStart === "string" ? t.periodStart : "",
    periodEnd: typeof t.periodEnd === "string" ? t.periodEnd : "",
    items,
  };
}

/** Normalize dashboard JSON; keeps weeklyRevenue API order (do not re-sort). */
export function parseBusinessDashboard(body: unknown): BusinessDashboardDto {
  const root =
    body && typeof body === "object" && "data" in (body as object)
      ? (body as { data: unknown }).data
      : body;
  const r = (root && typeof root === "object" ? root : {}) as Record<
    string,
    unknown
  >;
  const weekly = Array.isArray(r.weeklyRevenue)
    ? r.weeklyRevenue
        .map(parseWeeklyPoint)
        .filter((x): x is WeeklyRevenuePointDto => x !== null)
    : [];
  return {
    summary: parseSummary(r.summary),
    capacity: parseCapacity(r.capacity),
    weeklyRevenue: weekly,
    todayBookings: parseTodayBookings(r.todayBookings),
    topServices: parseTopServices(r.topServices),
  };
}
