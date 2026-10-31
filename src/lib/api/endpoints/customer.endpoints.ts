import { apiClient } from "@/lib/api/client";
import type {
  CreateCustomerInput,
  ListCustomersParams,
  UpdateCustomerInput,
} from "@/features/customer/types";

// Customer CRM under a business. All require Bearer + Admin or
// BusinessOwner of that business. List returns PagedCustomers (not a bare array).

function toQuery(params: ListCustomersParams = {}): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    q.set(key, String(value));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

// GET /api/business/:businessId/customers
export function listCustomersRequest(
  businessId: number,
  params?: ListCustomersParams
): Promise<Response> {
  return apiClient(
    `/api/business/${businessId}/customers${toQuery(params)}`
  );
}

// GET /api/business/:businessId/customers/:customerId
export function getCustomerRequest(
  businessId: number,
  customerId: number
): Promise<Response> {
  return apiClient(`/api/business/${businessId}/customers/${customerId}`);
}

// POST /api/business/:businessId/customers
export function createCustomerRequest(
  businessId: number,
  input: CreateCustomerInput
): Promise<Response> {
  return apiClient(`/api/business/${businessId}/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

// PUT /api/business/:businessId/customers/:customerId
export function updateCustomerRequest(
  businessId: number,
  customerId: number,
  input: UpdateCustomerInput
): Promise<Response> {
  return apiClient(`/api/business/${businessId}/customers/${customerId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

// DELETE /api/business/:businessId/customers/:customerId — soft-delete (isActive=false)
export function deleteCustomerRequest(
  businessId: number,
  customerId: number
): Promise<Response> {
  return apiClient(`/api/business/${businessId}/customers/${customerId}`, {
    method: "DELETE",
  });
}
