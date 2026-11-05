import { apiClient } from "@/lib/api/client";
import { backendFetch } from "@/lib/api/http";
import type {
  BusinessInput,
  BusinessListQuery,
  PagedBusinesses,
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
