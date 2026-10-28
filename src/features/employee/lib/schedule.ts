import type { WorkingHourDto } from "@/features/employee/types";

// .NET DayOfWeek → Persian weekday label.
export const DAY_LABELS: Record<number, string> = {
  0: "یکشنبه",
  1: "دوشنبه",
  2: "سه‌شنبه",
  3: "چهارشنبه",
  4: "پنجشنبه",
  5: "جمعه",
  6: "شنبه",
};

// Persian week reads Saturday → Friday.
export const WEEK_ORDER: readonly number[] = [6, 0, 1, 2, 3, 4, 5];

// "HH:mm:ss" → "HH:mm" for <input type="time">.
export function toTimeInput(value: string): string {
  return value.slice(0, 5);
}

// "HH:mm" (from the time input) → "HH:mm:00" for the API.
export function toTimePayload(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}

export function compareWorkingHours(a: WorkingHourDto, b: WorkingHourDto): number {
  if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
  return a.startTime.localeCompare(b.startTime);
}

export function groupByDay(hours: WorkingHourDto[]): Map<number, WorkingHourDto[]> {
  const map = new Map<number, WorkingHourDto[]>();
  for (const hour of hours) {
    const list = map.get(hour.dayOfWeek) ?? [];
    list.push(hour);
    map.set(hour.dayOfWeek, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }
  return map;
}

// Total number of days that have at least one shift scheduled.
export function scheduledDayCount(hours: WorkingHourDto[]): number {
  return new Set(hours.map((h) => h.dayOfWeek)).size;
}
