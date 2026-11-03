"use client";

import {
  CalendarDays,
  Clock,
  Scissors,
  UserRound,
} from "lucide-react";
import { cn } from "cn";
import type { BookingListItem } from "@/features/booking/types";
import {
  formatBookingDate,
  formatBookingPrice,
  formatBookingTimeRange,
} from "@/features/booking/lib/format";
import {
  BOOKING_STATUS_LABELS,
  bookingStatusBadgeClass,
} from "@/features/booking/lib/status";

const AVATAR_TONES = [
  "bg-primary-soft text-primary ring-primary-subtle",
  "bg-success-soft text-success-text ring-success-border",
  "bg-warning-soft text-warning-text ring-warning-border",
  "bg-error-soft text-error-text ring-error-border",
  "bg-surface-secondary text-slate-700 ring-border-strong",
] as const;

function avatarTone(id: number): string {
  return AVATAR_TONES[Math.abs(id) % AVATAR_TONES.length] ?? AVATAR_TONES[0];
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.length ? parts.map((p) => p[0]!).join("") : "";
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

function StatusBadge({ status }: { status: BookingListItem["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-lg px-2 py-1 text-[12px] font-bold",
        bookingStatusBadgeClass(status),
      )}
    >
      {BOOKING_STATUS_LABELS[status]}
    </span>
  );
}

function PriceLabel({ price }: { price: number | null }) {
  const formatted = formatBookingPrice(price);
  if (!formatted) {
    return (
      <span className="text-[13px] font-medium text-muted" aria-label="قیمت ثبت‌نشده">
        —
      </span>
    );
  }
  return (
    <span className="tnum text-[13.5px] font-bold text-text-primary">
      {formatted}
    </span>
  );
}

export function BookingCard({ booking }: { booking: BookingListItem }) {
  const customerInitials = initialsOf(booking.customerName);
  const employeeInitials = initialsOf(booking.employeeName);
  const dateLabel = formatBookingDate(booking.startTime);
  const timeLabel = formatBookingTimeRange(booking.startTime, booking.endTime);

  return (
    <li>
      <article
        aria-label={`رزرو ${booking.customerName} — ${booking.serviceName}`}
        className="rounded-2xl border border-border bg-surface px-4 py-3.5 transition-[background-color,border-color] duration-150 hover:border-border-strong hover:bg-surface-hover motion-reduce:transition-none sm:px-5 sm:py-4"
      >
        {/* Mobile */}
        <div className="flex flex-col gap-3 md:hidden">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold ring-1 ring-inset",
                avatarTone(booking.id),
              )}
            >
              {customerInitials || <UserRound className="h-4 w-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-[15px] font-bold text-text-primary">
                  {booking.customerName}
                </p>
                <StatusBadge status={booking.status} />
              </div>
              {booking.customerPhone ? (
                <p
                  dir="ltr"
                  className="mt-0.5 truncate text-start text-[12.5px] font-medium text-muted tnum"
                >
                  {formatPhone(booking.customerPhone)}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 ps-[3.25rem]">
            <p className="flex min-w-0 items-center gap-1.5 text-[13.5px] font-semibold text-text-primary">
              <Scissors className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
              <span className="truncate">{booking.serviceName}</span>
            </p>
            <p className="flex min-w-0 items-center gap-1.5 text-[13px] font-medium text-muted">
              <UserRound className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{booking.employeeName}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-border-subtle pt-3 text-[12.5px] font-medium text-muted">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {dateLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 tnum">
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {timeLabel}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-medium text-muted">مبلغ</span>
            <PriceLabel price={booking.price} />
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:grid md:grid-cols-[minmax(0,1.35fr)_minmax(0,1.1fr)_minmax(0,0.95fr)_minmax(0,1.15fr)_auto_auto] md:items-center md:gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold ring-1 ring-inset",
                avatarTone(booking.id),
              )}
            >
              {customerInitials || <UserRound className="h-4 w-4" />}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[14.5px] font-bold text-text-primary">
                {booking.customerName}
              </p>
              {booking.customerPhone ? (
                <p
                  dir="ltr"
                  className="mt-0.5 truncate text-start text-[12.5px] font-medium text-muted tnum"
                >
                  {formatPhone(booking.customerPhone)}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-2 border-s border-border-subtle ps-4">
            <Scissors className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
            <p className="truncate text-[14px] font-bold text-text-primary">
              {booking.serviceName}
            </p>
          </div>

          <div className="flex min-w-0 items-center gap-2 border-s border-border-subtle ps-4">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-[11px] font-bold text-slate-700 ring-1 ring-inset ring-border"
            >
              {employeeInitials || <UserRound className="h-3.5 w-3.5" />}
            </span>
            <p className="truncate text-[13.5px] font-semibold text-text-primary">
              {booking.employeeName}
            </p>
          </div>

          <div className="flex min-w-0 flex-col gap-1 border-s border-border-subtle ps-4 text-[12.5px] font-medium text-muted">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{dateLabel}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 tnum">
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {timeLabel}
            </span>
          </div>

          <div className="justify-self-end text-end">
            <PriceLabel price={booking.price} />
          </div>

          <div className="justify-self-end">
            <StatusBadge status={booking.status} />
          </div>
        </div>
      </article>
    </li>
  );
}

export function BookingCardSkeleton() {
  return (
    <li
      className="rounded-2xl border border-border bg-surface px-4 py-3.5 sm:px-5 sm:py-4"
      aria-hidden="true"
    >
      <div className="flex flex-col gap-3 md:hidden">
        <div className="flex items-center gap-3">
          <div className="skeleton-shimmer h-10 w-10 shrink-0 rounded-full bg-surface-secondary" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="skeleton-shimmer h-4 w-2/3 rounded-md bg-surface-secondary" />
            <div className="skeleton-shimmer h-3 w-1/3 rounded-md bg-surface-secondary" />
          </div>
          <div className="skeleton-shimmer h-6 w-16 rounded-lg bg-surface-secondary" />
        </div>
        <div className="space-y-2 ps-[3.25rem]">
          <div className="skeleton-shimmer h-3.5 w-1/2 rounded-md bg-surface-secondary" />
          <div className="skeleton-shimmer h-3.5 w-2/5 rounded-md bg-surface-secondary" />
        </div>
        <div className="skeleton-shimmer h-3.5 w-3/5 rounded-md bg-surface-secondary" />
      </div>
      <div className="hidden md:grid md:grid-cols-[minmax(0,1.35fr)_minmax(0,1.1fr)_minmax(0,0.95fr)_minmax(0,1.15fr)_auto_auto] md:items-center md:gap-4">
        <div className="flex items-center gap-3">
          <div className="skeleton-shimmer h-10 w-10 shrink-0 rounded-full bg-surface-secondary" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="skeleton-shimmer h-4 w-28 rounded-md bg-surface-secondary" />
            <div className="skeleton-shimmer h-3 w-20 rounded-md bg-surface-secondary" />
          </div>
        </div>
        <div className="skeleton-shimmer h-4 w-24 rounded-md bg-surface-secondary" />
        <div className="skeleton-shimmer h-4 w-20 rounded-md bg-surface-secondary" />
        <div className="space-y-2">
          <div className="skeleton-shimmer h-3.5 w-28 rounded-md bg-surface-secondary" />
          <div className="skeleton-shimmer h-3.5 w-20 rounded-md bg-surface-secondary" />
        </div>
        <div className="skeleton-shimmer h-4 w-16 rounded-md bg-surface-secondary" />
        <div className="skeleton-shimmer h-6 w-16 rounded-lg bg-surface-secondary" />
      </div>
    </li>
  );
}
