const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5135";

export async function proxyToBackend(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${BACKEND_URL}${path}`;
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}
