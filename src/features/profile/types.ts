// Backend contract: Application.Dtos.Profile.UserProfileDto
// Serialized by ASP.NET Core as camelCase.
export interface UserProfile {
  id: string;
  fullName: string;
  phoneNumber: string | null;
  profileImageUrl: string | null;
  email: string | null;
  roles: string[];
  businessId: number | null;
  employeeId: number | null;
}

export interface UpdateProfileInput {
  fullName: string;
  email?: string | null;
}

export type ProfileStatus = "idle" | "loading" | "loaded" | "error";

export const PROFILE_IMAGE_RULES = {
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ["image/jpeg", "image/png", "image/webp"],
} as const;

// Persian labels for backend role names.
export const ROLE_LABELS: Record<string, string> = {
  Customer: "مشتری",
  BusinessOwner: "مدیر کسب‌وکار",
  Employee: "کارمند",
  Admin: "مدیر سیستم",
};

export function roleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role;
}
