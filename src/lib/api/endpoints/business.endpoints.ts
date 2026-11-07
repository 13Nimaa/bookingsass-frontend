import { apiClient } from "@/lib/api/client";
import { backendFetch } from "@/lib/api/http";
import type {
  BusinessDetailsDto,
  BusinessDto,
  BusinessGalleryImageDto,
  BusinessInput,
  BusinessListQuery,
  PagedBusinesses,
  PublicEmployeeDto,
  PublicEmployeeServiceDto,
  PublicWorkingHourDto,
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
