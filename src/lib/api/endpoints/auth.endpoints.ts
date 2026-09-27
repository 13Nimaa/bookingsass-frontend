import { backendFetch } from "@/lib/api/http";
import type { LoginRequest, RegisterRequest } from "@/features/auth/types";

// Direct backend calls — no Next.js BFF in between.
// These functions are transport-only: they return the raw Response and
// never touch stores or browser storage, so both Server and Client
// Components can import this module.

// POST /api/auth/login
export function loginRequest(body: LoginRequest): Promise<Response> {
  return backendFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// POST /api/auth/register
export function registerRequest(body: RegisterRequest): Promise<Response> {
  return backendFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// POST /api/auth/refresh — single-use refresh token, rotates on success.
// The token travels in the JSON body: browsers cannot set a Cookie header
// via fetch, so cookie-based refresh is not possible from the client.
export function refreshRequest(refreshToken: string): Promise<Response> {
  return backendFetch("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

// POST /api/auth/logout — best-effort, logout is idempotent client-side.
export function logoutRequest(refreshToken: string | null): Promise<Response> {
  return backendFetch("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify(refreshToken ? { refreshToken } : {}),
  });
}
