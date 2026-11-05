export interface BusinessDto {
  id: number;
  name: string;
  city: string;
  address: string;
  description: string | null;
  profileImageUrl: string | null;
  ownerId: string;
  /**
   * Optional public-list fields. Absent until the backend ships them;
   * UI treats each as optional and simply does not render.
   */
  coverImageUrl?: string | null;
  ownerAvatarUrl?: string | null;
  neighborhood?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  isOpen?: boolean | null;
  startingPrice?: number | null;
  services?: string[] | null;
  genderAudience?: "men" | "women" | "unisex" | null;
}

/** Public list paging envelope (`GET /api/business`). */
export type PagedBusinesses = {
  items: BusinessDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type BusinessSortBy = "name" | "city" | "id";
export type BusinessSortOrder = "asc" | "desc";

export type BusinessListQuery = {
  search?: string;
  city?: string;
  sortBy?: BusinessSortBy;
  sortOrder?: BusinessSortOrder;
  page?: number;
  pageSize?: number; // 1…100
};

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
