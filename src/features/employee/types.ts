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

/** Body for POST /api/employees/:employeeId/services */
export interface AssignServiceInput {
  serviceId: number;
}
