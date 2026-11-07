/** One image in the multi-image salon gallery (`businessGallery`). */
export type BusinessGalleryImageDto = {
  url: string;
  /** Required for DELETE /api/business/gallery?publicId= */
  publicId: string;
};

export interface BusinessDto {
  id: number;
  name: string;
  city: string;
  address: string;
  description: string | null;
  profileImageUrl: string | null;
  ownerId: string;
  /** Multi-image gallery; always treat as array (normalize missing → []). */
  businessGallery?: BusinessGalleryImageDto[];
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

/** Nested on `GET /api/Business/{id}` — eligible service + effective pricing. */
export type PublicEmployeeServiceDto = {
  id: number;
  title: string;
  effectivePrice: number;
  effectiveDurationMinutes: number;
};

/** Nested public working hour (Gregorian date). */
export type PublicWorkingHourDto = {
  id: number;
  employeeId: number;
  date: string; // yyyy-MM-dd
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

/** Anonymous-safe staff on public business detail (no phone / userId). */
export type PublicEmployeeDto = {
  id: number;
  fullName: string;
  avatarUrl: string | null;
  services: PublicEmployeeServiceDto[];
  workingHours: PublicWorkingHourDto[];
};

/** `GET /api/Business/{id}` — business fields + nested public staff. */
export type BusinessDetailsDto = BusinessDto & {
  employees: PublicEmployeeDto[];
};

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

/** Backend cap for `POST /api/business/gallery`. */
export const BUSINESS_GALLERY_MAX = 10;

export type BusinessGalleryMutationResponse = {
  message: string;
  businessGallery: BusinessGalleryImageDto[];
};

/** Weekday keys from `GET /api/Business/dashboard` weeklyRevenue (Sat→Fri). */
export type DashboardWeekdayKey =
  | "saturday"
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday";

export type BusinessDashboardSummaryDto = {
  todayBookingsCount: number;
  /** Estimated completed-booking value; null when unavailable. */
  todayEstimatedRevenue: number | null;
  customerCount: number;
};

export type BusinessDashboardCapacityDto = {
  utilizationPercent: number | null;
  occupiedMinutes: number | null;
  availableMinutes: number | null;
};

export type WeeklyRevenuePointDto = {
  date: string;
  dayOfWeek: number;
  weekdayKey: DashboardWeekdayKey | string;
  estimatedRevenue: number;
  completedBookingCount: number;
};

export type DashboardTodayBookingItemDto = {
  id: number;
  customerName: string | null;
  serviceTitle: string;
  employeeName: string;
  startTime: string;
  endTime: string;
  /** BookingStatus numeric enum. */
  status: number;
  price: number | null;
};

export type DashboardTodayBookingsDto = {
  totalCount: number;
  items: DashboardTodayBookingItemDto[];
};

export type DashboardTopServiceItemDto = {
  serviceId: number;
  title: string;
  bookingCount: number;
  percentage: number;
};

export type DashboardTopServicesDto = {
  periodStart: string;
  periodEnd: string;
  items: DashboardTopServiceItemDto[];
};

/** `GET /api/Business/dashboard` — BusinessOwner only; business from JWT. */
export type BusinessDashboardDto = {
  summary: BusinessDashboardSummaryDto;
  capacity: BusinessDashboardCapacityDto | null;
  weeklyRevenue: WeeklyRevenuePointDto[];
  todayBookings: DashboardTodayBookingsDto;
  topServices: DashboardTopServicesDto;
};
