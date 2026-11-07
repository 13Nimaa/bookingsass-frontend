import { BookingStatus } from "@/features/booking/types";
import { BOOKING_STATUS_LABELS } from "@/features/booking/lib/status";

export const WEEKDAY_LABELS: Record<string, string> = {
  saturday: "شنبه",
  sunday: "یکشنبه",
  monday: "دوشنبه",
  tuesday: "سه‌شنبه",
  wednesday: "چهارشنبه",
  thursday: "پنجشنبه",
  friday: "جمعه",
};

export function weekdayLabel(key: string): string {
  return WEEKDAY_LABELS[key] ?? key;
}

/** Dashboard widget labels for the statuses the endpoint documents. */
export function dashboardBookingStatusLabel(status: number): string {
  if (status === BookingStatus.Pending) return "در انتظار";
  if (status === BookingStatus.Confirmed) return "تأیید شده";
  if (status === BookingStatus.Completed) return "انجام‌شده";
  return BOOKING_STATUS_LABELS[status as BookingStatus] ?? "نامشخص";
}
