import { NextResponse, type NextRequest } from "next/server";
import { REFRESH_COOKIE_NAME } from "@/lib/auth-cookies";

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(REFRESH_COOKIE_NAME);

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
