export interface CustomerDto {
  id: number;
  name: string;
  phoneNumber: string | null;
  email: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string; // ISO datetime UTC
  updatedAt: string | null;
  businessId: number;
}

export interface PagedCustomers {
  items: CustomerDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number; // 0 when totalCount is 0
}

export type CustomerSortBy = "createdAt" | "name" | "updatedAt";
export type CustomerSortOrder = "asc" | "desc";

export interface ListCustomersParams {
  search?: string;
  isActive?: boolean;
  createdFrom?: string; // YYYY-MM-DD or ISO
  createdTo?: string;
  sortBy?: CustomerSortBy;
  sortOrder?: CustomerSortOrder;
  page?: number;
  pageSize?: number; // 1…100
}

export interface CreateCustomerInput {
  name: string;
  phoneNumber?: string | null;
  email?: string | null;
  notes?: string | null;
}

export interface UpdateCustomerInput {
  name: string;
  phoneNumber?: string | null;
  email?: string | null;
  notes?: string | null;
  isActive: boolean;
}

/** Customer home — `GET /api/customer/dashboard` */
export type CustomerDashboardSummaryDto = {
  upcomingBookingsCount: number;
  totalBookingsCount: number;
  favoriteSalonsCount: number;
};

export type CustomerDashboardBookingItemDto = {
  id: number;
  startTime: string;
  endTime: string;
  status: number;
  businessId: number;
  businessName: string;
  businessProfileImageUrl: string | null;
  serviceName: string;
  employeeName: string;
};

export type CustomerUpcomingBookingsDto = {
  /** All upcoming bookings, not just `items.length`. */
  totalCount: number;
  items: CustomerDashboardBookingItemDto[];
};

export type CustomerDashboardDto = {
  summary: CustomerDashboardSummaryDto;
  upcomingBookings: CustomerUpcomingBookingsDto;
  recentBookings: CustomerDashboardBookingItemDto[];
};

/** `GET/POST /api/customer/favorites` */
export type BusinessFavoriteDto = {
  businessId: number;
  name: string;
  city: string;
  profileImageUrl: string | null;
  favoritedAt: string;
};
