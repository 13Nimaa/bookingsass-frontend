export interface BusinessDto {
  id: number;
  name: string;
  city: string;
  address: string;
  description: string | null;
  profileImageUrl: string | null;
  ownerId: string;
}

// GET /api/business/mine response — wraps the current user's business.
export interface MyBusinessResponse {
  hasBusiness: boolean;
  business: BusinessDto | null;
}

export interface BusinessInput {
  name: string;
  city: string;
  address: string;
  description: string | null;
}

export const BUSINESS_IMAGE_RULES = {
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ["image/jpeg", "image/png", "image/webp"],
} as const;
