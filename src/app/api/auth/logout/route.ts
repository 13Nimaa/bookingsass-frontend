import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { proxyToBackend } from "@/lib/backend-api";
import { REFRESH_COOKIE_NAME, clearRefreshCookie } from "@/lib/auth-cookies";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

  // Fire-and-forget to backend — logout is idempotent
  if (refreshToken) {
    try {
      await proxyToBackend("/api/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Ignore backend errors — always clear local state
    }
  }

  const response = NextResponse.json({ message: "Logged out successfully." });
  clearRefreshCookie(response);
  return response;
}
