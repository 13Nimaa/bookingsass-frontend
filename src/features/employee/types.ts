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
  dayOfWeek: number;
  startTime: string; // "HH:mm:ss"
  endTime: string; // "HH:mm:ss"
}

export interface CreateEmployeeInput {
  phoneNumber: string;
}

export interface WorkingHourInput {
  dayOfWeek: number;
  startTime: string; // "HH:mm:ss"
  endTime: string; // "HH:mm:ss"
}
