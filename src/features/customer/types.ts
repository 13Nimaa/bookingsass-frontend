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
