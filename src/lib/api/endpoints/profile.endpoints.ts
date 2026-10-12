import { apiClient } from "@/lib/api/client";
import type { UpdateProfileInput } from "@/features/profile/types";

// Direct backend calls — no Next.js BFF in between.
// Transport-only: returns the raw Response, never touches stores,
// so both Server and Client Components can import this module.
//
// Backend contract (ProfileController, [Authorize], route api/profile):
//   GET    /api/profile        -> UserProfileDto
//   PUT    /api/profile        -> UserProfileDto (body: { fullName, email? })
//   POST   /api/profile/image  -> { message, profileImageUrl } (multipart file)
//   DELETE /api/profile/image  -> { message }

// GET /api/profile — current user's full profile.
export function getProfileRequest(): Promise<Response> {
  return apiClient("/api/profile");
}

// PUT /api/profile — update full name / email. Returns updated profile.
export function updateProfileRequest(
  input: UpdateProfileInput
): Promise<Response> {
  return apiClient("/api/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

// POST /api/profile/image — multipart upload. Do NOT set Content-Type;
// the browser adds the boundary. Backend accepts jpg/png/webp <= 5MB.
export function uploadProfileImageRequest(file: File): Promise<Response> {
  const form = new FormData();
  form.append("file", file);
  return apiClient("/api/profile/image", {
    method: "POST",
    body: form,
  });
}

// DELETE /api/profile/image — remove current profile image.
export function deleteProfileImageRequest(): Promise<Response> {
  return apiClient("/api/profile/image", { method: "DELETE" });
}
