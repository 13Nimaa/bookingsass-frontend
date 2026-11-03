import { BookingStatus } from "@/features/booking/types";

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  [BookingStatus.Pending]: "در انتظار",
  [BookingStatus.Confirmed]: "تأیید شده",
  [BookingStatus.Cancelled]: "لغو شده",
  [BookingStatus.Completed]: "تکمیل شده",
  [BookingStatus.Expired]: "منقضی شده",
};

export const BOOKING_STATUS_OPTIONS: {
  value: BookingStatus;
  label: string;
}[] = [
  { value: BookingStatus.Pending, label: BOOKING_STATUS_LABELS[BookingStatus.Pending] },
  { value: BookingStatus.Confirmed, label: BOOKING_STATUS_LABELS[BookingStatus.Confirmed] },
  { value: BookingStatus.Cancelled, label: BOOKING_STATUS_LABELS[BookingStatus.Cancelled] },
  { value: BookingStatus.Completed, label: BOOKING_STATUS_LABELS[BookingStatus.Completed] },
  { value: BookingStatus.Expired, label: BOOKING_STATUS_LABELS[BookingStatus.Expired] },
];

export function bookingStatusBadgeClass(status: BookingStatus): string {
  switch (status) {
    case BookingStatus.Pending:
      return "bg-warning-soft text-warning-text";
    case BookingStatus.Confirmed:
      return "bg-success-soft text-success-text";
    case BookingStatus.Cancelled:
      return "bg-error-soft text-error-text";
    case BookingStatus.Completed:
      return "bg-success-soft/70 text-success-text";
    case BookingStatus.Expired:
      return "bg-surface-secondary text-muted";
    default:
      return "bg-surface-secondary text-muted";
  }
}
