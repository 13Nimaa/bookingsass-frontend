import type { WorkingHourDto } from "@/features/employee/types";

// "HH:mm:ss" → "HH:mm" for display and time controls.
export function toTimeInput(value: string): string {
  return value.slice(0, 5);
}

// "HH:mm" (from the time input) → "HH:mm:00" for the API.
export function toTimePayload(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}

export function compareWorkingHours(a: WorkingHourDto, b: WorkingHourDto): number {
  if (a.date !== b.date) return (a.date ?? "").localeCompare(b.date ?? "");
  return a.startTime.localeCompare(b.startTime);
}

export function groupByDate(hours: WorkingHourDto[]): Map<string, WorkingHourDto[]> {
  const map = new Map<string, WorkingHourDto[]>();
  for (const hour of hours) {
    if (!hour.date) continue;
    const list = map.get(hour.date) ?? [];
    list.push(hour);
    map.set(hour.date, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }
  return map;
}

// Total number of calendar dates that have at least one shift scheduled.
export function scheduledDateCount(hours: WorkingHourDto[]): number {
  return new Set(hours.flatMap((hour) => hour.date ? [hour.date] : [])).size;
}
