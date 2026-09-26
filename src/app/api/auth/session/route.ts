import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { proxyToBackend } from "@/lib/backend-api";
import { REFRESH_COOKIE_NAME, setRefreshCookie, clearRefreshCookie } from "@/lib/auth-cookies";

export async function GET() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

  if (!refreshToken) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // Refresh tokens are single-use, so "validate" means "rotate": a successful
  // refresh here gives us a fresh access token AND proves the session is alive.
  const backendRes = await proxyToBackend("/api/auth/refresh", {
    method: "POST",
    // Backend reads the token from a cookie (Request.Cookies["refreshToken"]),
    // not from the JSON body.
    headers: { Cookie: `refreshToken=${refreshToken}` },
    body: JSON.stringify({ refreshToken }),
  });

  if (!backendRes.ok) {
    const response = NextResponse.json({ authenticated: false }, { status: 401 });
    clearRefreshCookie(response);
    return response;
  }

  const data = await backendRes.json();
  const response = NextResponse.json({
    authenticated: true,
    user: data.user,
    accessToken: data.accessToken,
    expiresAt: data.expiresAt,
  });

  setRefreshCookie(response, data.refreshToken);
  return response;
}
