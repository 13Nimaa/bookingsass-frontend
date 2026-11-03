export interface EmployeeDto {
  id: number;
  userId: string;
  fullName: string;
  phoneNumber: string;
  businessId: number;
}

// .NET DayOfWeek: Sunday = 0 … Saturday = 6.
export interface WorkingHourDto {
  id: number;
  employeeId: number;
  date: string | null; // Gregorian ISO date: "YYYY-MM-DD"
  dayOfWeek: number;
  startTime: string; // "HH:mm:ss"
  endTime: string; // "HH:mm:ss"
}

export interface CreateEmployeeInput {
  phoneNumber: string;
}

export interface WorkingHourInput {
  date: string; // Gregorian ISO date: "YYYY-MM-DD"
  startTime: string; // "HH:mm:ss"
  endTime: string; // "HH:mm:ss"
}

/**
 * Body for POST /api/employees/:employeeId/services.
 * Overrides are optional: omitting a field (or sending `undefined`, which
 * JSON.stringify drops) inherits the service's default value.
 */
export interface AssignServiceInput {
  serviceId: number;
  priceOverride?: number;
  durationMinutesOverride?: number;
}

/**
 * Body for PUT /api/employees/:employeeId/services/:serviceId.
 * Only include fields the user intentionally changed. Send an explicit
 * `null` to clear an override and inherit the salon default. Omit a
 * field entirely when it was not edited.
 */
export interface UpdateEmployeeServiceInput {
  priceOverride?: number | null;
  durationMinutesOverride?: number | null;
}

/** One failed assignment inside a multi-service submission. */
export interface AssignServiceFailure {
  serviceId: number;
  message: string;
  /** HTTP status, or null for a transport/network failure. */
  status: number | null;
}

/** Result of submitting one assignment request per selected service. */
export interface AssignServicesResult {
  assigned: number;
  failed: AssignServiceFailure[];
}

/**
 * GET /api/employees/:employeeId/services response item.
 * `id` is the service id. Each property is independent: an override
 * of `null` means the service's default value is used; a non-null
 * override means a custom employee-specific value is configured.
 * Never infer the state by comparing effective and default values.
 */
export interface EmployeeServiceDto {
  id: number;
  title: string;
  defaultPrice: number;
  defaultDurationMinutes: number;
  priceOverride: number | null;
  durationMinutesOverride: number | null;
  effectivePrice: number;
  effectiveDurationMinutes: number;
  businessId: number;
}
