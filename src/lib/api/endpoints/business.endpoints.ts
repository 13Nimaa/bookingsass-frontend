import { apiClient } from "@/lib/api/client";
import { backendFetch } from "@/lib/api/http";
import type { BusinessDto, BusinessInput } from "@/features/business/types";

// Direct backend calls — no Next.js BFF in between.
// listBusinesses is server-safe (public, no token). The authenticated calls
// go through apiClient, which attaches the in-memory access token and
// retries once after a single-flight token refresh on 401.

// GET /api/business — public list, fresh on every request.
export async function listBusinesses(): Promise<{
  data: BusinessDto[];
  failed: boolean;
}> {
  try {
    const res = await backendFetch("/api/business", { cache: "no-store" });
    if (!res.ok) return { data: [], failed: true };
    return { data: (await res.json()) as BusinessDto[], failed: false };
  } catch {
    return { data: [], failed: true };
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
  input: BusinessInput
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
  input: BusinessInput
): Promise<Response> {
  return apiClient("/api/Business/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
