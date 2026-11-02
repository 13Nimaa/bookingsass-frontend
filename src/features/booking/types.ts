/** BookingStatus — numeric in JSON (no string enum converter on BE). */
export const BookingStatus = {
  Pending: 0,
  Confirmed: 1,
  Cancelled: 2,
  Completed: 3,
  Expired: 4,
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

/** BookingCreatorType — numeric in JSON. */
export const BookingCreatorType = {
  Customer: 0,
  Guest: 1,
  BusinessOwner: 2, // reserved; owner-create-on-behalf not exposed yet
} as const;

export type BookingCreatorType =
  (typeof BookingCreatorType)[keyof typeof BookingCreatorType];

/** Default pending auto-expire window (BE `Booking:PendingExpirationMinutes`). */
export const PENDING_EXPIRATION_MINUTES = 30;

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type BookingDto = {
  id: number;
  businessId: number;
  customerId: number;
  serviceId: number;
  employeeId: number;
  startTime: string; // ISO UTC
  endTime: string; // ISO UTC (server-calculated)
  notes: string | null;
  status: BookingStatus;
  creatorType: BookingCreatorType;
  createdByUserId: string | null;
  createdAt: string; // ISO UTC
};

export type CreateBookingInput = {
  businessId: number;
  serviceId: number;
  employeeId: number;
  startTime: string; // ISO UTC
  /** Required by JSON shape; server recalculates from Service.DurationMinutes. */
  endTime: string;
};

export type CreateGuestBookingInput = CreateBookingInput & {
  name: string;
  phoneNumber: string;
};

export type AvailabilitySlot = {
  startTime: string; // DateTimeOffset ISO, e.g. "2026-11-10T10:00:00+03:30"
  endTime: string;
};

export type AvailabilityParams = {
  businessId: number;
  serviceId: number;
  employeeId: number;
  /** Gregorian `yyyy-MM-dd` in business-local timezone. */
  date: string;
};

export type UpdateBookingStatusInput = {
  status: BookingStatus;
};

export type BookingListItem = {
  id: number;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  creatorType: BookingCreatorType;
  customerName: string;
  customerPhone: string | null;
  serviceName: string;
  serviceDurationMinutes: number;
  employeeName: string;
  businessId: number;
};

export type ListBookingsParams = {
  status?: BookingStatus;
  employeeId?: number;
  customerId?: number;
  serviceId?: number;
  fromDate?: string; // UTC ISO inclusive lower on StartTime
  toDate?: string; // UTC ISO inclusive upper on StartTime
  search?: string; // customer name / phone
  page?: number; // default 1
  pageSize?: number; // 1…100, default 20
};

export type PagedBookings = PagedResult<BookingListItem>;

export type BookingDetails = {
  id: number;
  businessId: number;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  creatorType: BookingCreatorType;
  createdAt: string;
  notes: string | null;
  customer: { id: number; name: string; phoneNumber: string | null };
  service: {
    id: number;
    name: string;
    durationMinutes: number;
    price: number;
  };
  employee: {
    id: number;
    name: string;
    profileImageUrl: string | null;
  };
  business: { id: number; name: string };
};

export type CustomerBookingListItem = {
  id: number;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  creatorType: BookingCreatorType;
  businessName: string;
  businessId: number;
  serviceName: string;
  serviceDurationMinutes: number;
  employeeName: string;
};

export type ListMyBookingsParams = {
  status?: BookingStatus;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number; // max 100
};

export type PagedMyBookings = PagedResult<CustomerBookingListItem>;
