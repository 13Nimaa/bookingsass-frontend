import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { proxyToBackend } from "@/lib/backend-api";
import { REFRESH_COOKIE_NAME, setRefreshCookie, clearRefreshCookie } from "@/lib/auth-cookies";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

  if (!refreshToken) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let backendRes: Response;
  try {
    backendRes = await proxyToBackend("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    // Backend unreachable — transient, don't clear the cookie
    return new NextResponse("Backend unavailable", { status: 503 });
  }

  if (!backendRes.ok) {
    // Rate limit is not an auth failure — forward it and keep the cookie
    if (backendRes.status === 429) {
      const text = await backendRes.text();
      return new NextResponse(text || "Too many requests", {
        status: 429,
        headers: { "Retry-After": backendRes.headers.get("Retry-After") ?? "60" },
      });
    }
    const response = new NextResponse("Unauthorized", { status: 401 });
    clearRefreshCookie(response);
    return response;
  }

  const data = await backendRes.json();
  const response = NextResponse.json({
    accessToken: data.accessToken,
    expiresAt: data.expiresAt,
  });

  // Rotate: set new refresh token, old one is now invalid
  setRefreshCookie(response, data.refreshToken);
  return response;
}