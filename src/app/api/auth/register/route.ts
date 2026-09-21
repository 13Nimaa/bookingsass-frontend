import { NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/backend-api";
import { setRefreshCookie } from "@/lib/auth-cookies";

export async function POST(request: Request) {
  const body = await request.json();

  const backendRes = await proxyToBackend("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!backendRes.ok) {
    const text = await backendRes.text();
    return new NextResponse(text, { status: backendRes.status });
  }

  const data = await backendRes.json();
  const response = NextResponse.json({
    user: data.user,
    accessToken: data.accessToken,
    expiresAt: data.expiresAt,
  });

  setRefreshCookie(response, data.refreshToken);
  return response;
}