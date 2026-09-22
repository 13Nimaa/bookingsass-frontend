import { NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/backend-api";

// Public — no auth. Passes query params through for future search/filtering.
export async function GET(request: Request) {
  const { search } = new URL(request.url);
  try {
    const backendRes = await proxyToBackend(`/api/business${search}`);
    const text = await backendRes.text();
    return new NextResponse(text, {
      status: backendRes.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json({ message: "Backend unavailable" }, { status: 503 });
  }
}
