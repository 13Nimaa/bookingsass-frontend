import { apiClient } from "@/lib/api/client";
import { backendFetch } from "@/lib/api/http";
import type { ServiceInput } from "@/features/service/types";

// Services under a business. List is public; get/create/update/delete need
// Bearer + BusinessOwner (of that business) or Admin.

// GET /api/business/:businessId/services — public catalog (no auth).
export function listServicesRequest(businessId: number): Promise<Response> {
  return backendFetch(`/api/business/${businessId}/services`);
}

// GET /api/business/:businessId/services/:serviceId — owner/admin detail.
export function getServiceRequest(
  businessId: number,
  serviceId: number
): Promise<Response> {
  return apiClient(`/api/business/${businessId}/services/${serviceId}`);
}

// POST /api/business/:businessId/services
export function createServiceRequest(
  businessId: number,
  input: ServiceInput
): Promise<Response> {
  return apiClient(`/api/business/${businessId}/services`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

// PUT /api/business/:businessId/services/:serviceId
export function updateServiceRequest(
  businessId: number,
  serviceId: number,
  input: ServiceInput
): Promise<Response> {
  return apiClient(`/api/business/${businessId}/services/${serviceId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

// DELETE /api/business/:businessId/services/:serviceId
export function deleteServiceRequest(
  businessId: number,
  serviceId: number
): Promise<Response> {
  return apiClient(`/api/business/${businessId}/services/${serviceId}`, {
    method: "DELETE",
  });
}
