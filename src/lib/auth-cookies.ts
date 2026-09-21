import { NextResponse } from "next/server";

export const REFRESH_COOKIE_NAME = "bf_refresh_token";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  // "/" not "/api/auth" — src/proxy.ts guards /dashboard by reading this cookie,
  // and a path-scoped cookie is never sent for those requests.
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export function setRefreshCookie(response: NextResponse, token: string) {
  response.cookies.set(REFRESH_COOKIE_NAME, token, COOKIE_OPTIONS);
}

export function clearRefreshCookie(response: NextResponse) {
  response.cookies.delete(REFRESH_COOKIE_NAME);
}
