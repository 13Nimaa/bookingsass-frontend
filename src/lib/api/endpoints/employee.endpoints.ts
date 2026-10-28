import { apiClient } from "@/lib/api/client";
import type { CreateEmployeeInput, WorkingHourInput } from "@/features/employee/types";

// Employee + working-hours endpoints. All require the authenticated
// business owner (or, for working hours, the employee themselves).
// Shapes: list endpoints return a bare array; create/update return an
// envelope ({ message, data }); delete returns { message }.

// GET /api/business/:businessId/employees — owned business's employees.
export function listEmployeesRequest(businessId: number): Promise<Response> {
  return apiClient(`/api/business/${businessId}/employees`);
}

// POST /api/business/:businessId/employees — links an existing user by phone.
export function createEmployeeRequest(
  businessId: number,
  input: CreateEmployeeInput
): Promise<Response> {
  return apiClient(`/api/business/${businessId}/employees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

// DELETE /api/business/:businessId/employees/:employeeId — unlink an employee.
export function deleteEmployeeRequest(
  businessId: number,
  employeeId: number
): Promise<Response> {
  return apiClient(`/api/business/${businessId}/employees/${employeeId}`, {
    method: "DELETE",
  });
}

// GET /api/business/:businessId/employees/:employeeId/working-hours
export function listWorkingHoursRequest(
  businessId: number,
  employeeId: number
): Promise<Response> {
  return apiClient(
    `/api/business/${businessId}/employees/${employeeId}/working-hours`
  );
}

// POST /api/business/:businessId/employees/:employeeId/working-hours
export function createWorkingHourRequest(
  businessId: number,
  employeeId: number,
  input: WorkingHourInput
): Promise<Response> {
  return apiClient(
    `/api/business/${businessId}/employees/${employeeId}/working-hours`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );
}

// PUT /api/business/:businessId/employees/:employeeId/working-hours/:id
export function updateWorkingHourRequest(
  businessId: number,
  employeeId: number,
  id: number,
  input: WorkingHourInput
): Promise<Response> {
  return apiClient(
    `/api/business/${businessId}/employees/${employeeId}/working-hours/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );
}

// DELETE /api/business/:businessId/employees/:employeeId/working-hours/:id
export function deleteWorkingHourRequest(
  businessId: number,
  employeeId: number,
  id: number
): Promise<Response> {
  return apiClient(
    `/api/business/${businessId}/employees/${employeeId}/working-hours/${id}`,
    { method: "DELETE" }
  );
}
