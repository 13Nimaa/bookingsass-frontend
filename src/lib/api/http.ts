// Base URL of the backend API. The browser calls the backend directly,
// so the URL must be exposed to the client (NEXT_PUBLIC_ prefix).
export const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5135";

// Raw backend fetch shared by the endpoint modules below.
// Server-safe: no auth state, no browser APIs at module scope.
export function backendFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${BACKEND_BASE_URL}${path}`, {
    ...init,
    headers,
    // Allow backend-set cookies (e.g. refresh cookie) to flow when the
    // backend uses them. The JSON body carries the tokens we manage.
    credentials: "include",
  });
}
