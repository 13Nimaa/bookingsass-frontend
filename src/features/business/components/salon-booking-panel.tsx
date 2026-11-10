"use client";

import * as React from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  UserRound,
} from "lucide-react";
import { cn } from "cn";
import { AuthError } from "@/components/shared/auth-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JalaliDatePicker } from "@/features/employee/components/jalali-date-picker";
import {
  formatJalaliDate,
  jalaliToGregorianIso,
  todayJalali,
  type JalaliDate,
} from "@/features/employee/lib/jalali-date";
import { formatDuration, formatPrice } from "@/features/employee/lib/format";
import {
  formatBookingDate,
  formatBookingPrice,
  formatBookingTime,
} from "@/features/booking/lib/format";
import {
  fetchAvailabilitySlots,
  placeholderEndUtcIso,
  slotStartToUtcIso,
  submitAuthenticatedBooking,
  submitGuestBooking,
} from "@/features/booking/lib/public-booking";
import {
  guestBookingSchema,
  toGuestPhone,
} from "@/features/booking/schemas/guest-booking.schema";
import { BOOKING_STATUS_LABELS } from "@/features/booking/lib/status";
import type {
  AvailabilitySlot,
  BookingDto,
} from "@/features/booking/types";
import type { ServiceDto } from "@/features/service/types";
import { useAuthStore } from "@/features/auth/store/auth-store";

export type PublicEmployeeOption = {
  id: number;
  fullName: string;
  avatarUrl?: string | null;
  services: Array<{
    id: number;
    title: string;
    effectivePrice: number;
    effectiveDurationMinutes: number;
  }>;
};

interface SalonBookingPanelProps {
  businessId: number;
  services: ServiceDto[];
  employees: PublicEmployeeOption[];
  selectedServiceId: number | null;
  onSelectService: (serviceId: number) => void;
  className?: string;
  /** When true, render a compact sticky mobile CTA bar target. */
  mobileCtaId?: string;
}

function formatSlotLabel(iso: string): string {
  return new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function SalonBookingPanel({
  businessId,
  services,
  employees,
  selectedServiceId,
  onSelectService,
  className,
  mobileCtaId = "salon-booking-panel",
}: SalonBookingPanelProps) {
  const authStatus = useAuthStore((s) => s.status);
  const isAuthenticated = authStatus === "authenticated";

  const [employeeId, setEmployeeId] = React.useState<number | null>(null);
  const [date, setDate] = React.useState<JalaliDate>(() => todayJalali());
  const [slots, setSlots] = React.useState<AvailabilitySlot[]>([]);
  const [slotsStatus, setSlotsStatus] = React.useState<
    "idle" | "loading" | "loaded" | "error"
  >("idle");
  const [slotsError, setSlotsError] = React.useState<string | null>(null);
  const [slotStart, setSlotStart] = React.useState<string | null>(null);

  const [guestName, setGuestName] = React.useState("");
  const [guestPhone, setGuestPhone] = React.useState("");
  const [guestFieldErrors, setGuestFieldErrors] = React.useState<{
    name?: string;
    phoneNumber?: string;
  }>({});

  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [confirmed, setConfirmed] = React.useState<BookingDto | null>(null);

  const selectedService =
    services.find((s) => s.id === selectedServiceId) ?? null;
  const eligibleEmployees =
    selectedServiceId == null
      ? []
      : employees.filter((employee) =>
          employee.services.some((service) => service.id === selectedServiceId),
        );
  const selectedEmployee =
    eligibleEmployees.find((e) => e.id === employeeId) ?? null;
  const selectedAssignment =
    selectedEmployee && selectedServiceId != null
      ? (selectedEmployee.services.find((s) => s.id === selectedServiceId) ??
        null)
      : null;
  const displayPrice =
    selectedAssignment?.effectivePrice ?? selectedService?.price ?? null;
  const displayDuration =
    selectedAssignment?.effectiveDurationMinutes ??
    selectedService?.durationMinutes ??
    null;
  const today = todayJalali();
  const gregorianDate = jalaliToGregorianIso(date);

  const [trackedServiceId, setTrackedServiceId] =
    React.useState(selectedServiceId);
  if (trackedServiceId !== selectedServiceId) {
    setTrackedServiceId(selectedServiceId);
    setEmployeeId(null);
    setSlotStart(null);
    setSlots([]);
    setSlotsStatus("idle");
    setSlotsError(null);
    setSubmitError(null);
  }

  const selectionKey = `${employeeId ?? "none"}|${gregorianDate}`;
  const [trackedSelectionKey, setTrackedSelectionKey] =
    React.useState(selectionKey);
  if (trackedSelectionKey !== selectionKey) {
    setTrackedSelectionKey(selectionKey);
    setSlotStart(null);
    setSubmitError(null);
  }

  const canFetchSlots = selectedServiceId != null && employeeId != null;

  React.useEffect(() => {
    if (!canFetchSlots || selectedServiceId == null || employeeId == null) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setSlotsStatus("loading");
      setSlotsError(null);
      const result = await fetchAvailabilitySlots({
        businessId,
        serviceId: selectedServiceId,
        employeeId,
        date: gregorianDate,
      });
      if (cancelled) return;
      if (result.error) {
        setSlots([]);
        setSlotsError(result.error);
        setSlotsStatus("error");
        return;
      }
      setSlots(result.slots);
      setSlotsStatus("loaded");
    })();

    return () => {
      cancelled = true;
    };
  }, [businessId, selectedServiceId, employeeId, gregorianDate, canFetchSlots]);

  const shownSlots = canFetchSlots ? slots : [];
  const shownSlotsStatus = canFetchSlots ? slotsStatus : "idle";
  const shownSlotsError = canFetchSlots ? slotsError : null;

  const canSubmit =
    Boolean(selectedService) &&
    Boolean(employeeId) &&
    Boolean(slotStart) &&
    !submitting &&
    !confirmed;

  const handleSubmit = async () => {
    if (!selectedService || !employeeId || !slotStart || submitting) return;
    setSubmitError(null);

    if (!isAuthenticated) {
      const parsed = guestBookingSchema.safeParse({
        name: guestName,
        phoneNumber: guestPhone,
      });
      if (!parsed.success) {
        const fieldErrors: { name?: string; phoneNumber?: string } = {};
        for (const issue of parsed.error.issues) {
          const key = issue.path[0];
          if (key === "name" || key === "phoneNumber") {
            fieldErrors[key] = issue.message;
          }
        }
        setGuestFieldErrors(fieldErrors);
        return;
      }
      setGuestFieldErrors({});
    }

    setSubmitting(true);
    const startTime = slotStartToUtcIso(slotStart);
    const endTime = placeholderEndUtcIso(
      slotStart,
      displayDuration ?? selectedService.durationMinutes,
    );

    const result = isAuthenticated
      ? await submitAuthenticatedBooking({
          businessId,
          serviceId: selectedService.id,
          employeeId,
          startTime,
          endTime,
        })
      : await submitGuestBooking({
          businessId,
          serviceId: selectedService.id,
          employeeId,
          startTime,
          endTime,
          name: guestName.trim(),
          phoneNumber: toGuestPhone(guestPhone),
        });

    setSubmitting(false);
    if (result.error || !result.booking) {
      setSubmitError(result.error ?? "ثبت رزرو انجام نشد.");
      return;
    }
    setConfirmed(result.booking);
  };

  if (confirmed) {
    return (
      <aside
        id={mobileCtaId}
        className={cn(
          "rounded-[1.5rem] border border-border bg-surface p-5 shadow-[0_10px_30px_-22px_rgba(30,27,75,0.35)] sm:p-6",
          className,
        )}
      >
        <div className="flex flex-col items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-success-soft text-success">
            <CheckCircle2 className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-text-primary">
              رزرو ثبت شد
            </h2>
            <p className="mt-1 text-[13px] leading-6 text-muted">
              وضعیت فعلی:{" "}
              {BOOKING_STATUS_LABELS[confirmed.status] ?? "در انتظار"}
            </p>
          </div>
        </div>

        <dl className="mt-5 space-y-2.5 text-[13px]">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted">خدمت</dt>
            <dd className="font-bold text-text-primary">
              {selectedService?.title ?? "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted">پرسنل</dt>
            <dd className="font-bold text-text-primary">
              {selectedEmployee?.fullName ?? "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted">تاریخ</dt>
            <dd className="font-bold text-text-primary">
              {formatBookingDate(confirmed.startTime)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted">ساعت</dt>
            <dd className="font-bold text-text-primary">
              {formatBookingTime(confirmed.startTime)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted">مبلغ</dt>
            <dd className="font-bold text-text-primary">
              {formatBookingPrice(confirmed.price) ?? "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted">کد رزرو</dt>
            <dd className="font-bold tabular-nums text-text-primary">
              {confirmed.id.toLocaleString("fa-IR")}
            </dd>
          </div>
        </dl>

        <Button
          type="button"
          variant="outline"
          className="mt-5 h-11 w-full rounded-xl"
          onClick={() => {
            setConfirmed(null);
            setSlotStart(null);
            setSubmitError(null);
          }}
        >
          رزرو جدید
        </Button>
      </aside>
    );
  }

  return (
    <aside
      id={mobileCtaId}
      className={cn(
        "rounded-[1.5rem] border border-border bg-surface p-5 shadow-[0_10px_30px_-22px_rgba(30,27,75,0.35)] sm:p-6",
        className,
      )}
    >
      <div className="mb-5">
        <h2 className="text-[18px] font-bold text-text-primary">رزرو نوبت</h2>
        <p className="mt-1.5 text-[13px] leading-6 text-muted">
          برای رزرو نوبت، ابتدا خدمات موردنظر را انتخاب کنید.
        </p>
      </div>

      <div className="space-y-5">
        {/* Step 1 — Service */}
        <section>
          <p className="mb-2 text-[12px] font-bold text-muted">۱. انتخاب خدمت</p>
          {services.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-surface-secondary/60 px-3 py-3 text-[13px] text-muted">
              خدمتی برای این سالن ثبت نشده است.
            </p>
          ) : (
            <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto pe-1">
              {services.map((service) => {
                const active = service.id === selectedServiceId;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => onSelectService(service.id)}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-right transition-colors",
                      active
                        ? "border-primary bg-primary-soft"
                        : "border-border bg-surface hover:border-border-strong hover:bg-surface-secondary",
                    )}
                  >
                    <span className="block text-[13px] font-bold text-text-primary">
                      {service.title}
                    </span>
                    <span className="mt-0.5 block text-[12px] text-muted">
                      از {formatPrice(service.price)} ·{" "}
                      {formatDuration(service.durationMinutes)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Step 2 — Employee */}
        <section>
          <p className="mb-2 text-[12px] font-bold text-muted">۲. انتخاب پرسنل</p>
          {!selectedServiceId ? (
            <p className="text-[13px] text-muted">ابتدا یک خدمت انتخاب کنید.</p>
          ) : eligibleEmployees.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-surface-secondary/60 px-3 py-3 text-[13px] text-muted">
              پرسنلی برای این خدمت در دسترس نیست.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-1.5">
              {eligibleEmployees.map((employee) => {
                const active = employee.id === employeeId;
                const assignment = employee.services.find(
                  (s) => s.id === selectedServiceId,
                );
                return (
                  <button
                    key={employee.id}
                    type="button"
                    onClick={() => setEmployeeId(employee.id)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-right transition-colors",
                      active
                        ? "border-primary bg-primary-soft"
                        : "border-border bg-surface hover:border-border-strong hover:bg-surface-secondary",
                    )}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-secondary text-muted">
                      {employee.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={employee.avatarUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserRound className="h-4 w-4" strokeWidth={1.75} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-bold text-text-primary">
                        {employee.fullName}
                      </span>
                      {assignment ? (
                        <span className="mt-0.5 block text-[12px] text-muted">
                          {formatPrice(assignment.effectivePrice)} ·{" "}
                          {formatDuration(assignment.effectiveDurationMinutes)}
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Step 3 — Date */}
        <section>
          <p className="mb-2 text-[12px] font-bold text-muted">۳. انتخاب تاریخ</p>
          <JalaliDatePicker
            value={date}
            onChange={setDate}
            minDate={today}
            disabled={!selectedServiceId || !employeeId}
          />
          <p className="mt-1.5 text-[12px] text-muted">
            {formatJalaliDate(date, { includeWeekday: true })}
          </p>
        </section>

        {/* Step 4 — Time */}
        <section>
          <p className="mb-2 text-[12px] font-bold text-muted">۴. انتخاب ساعت</p>
          {!selectedServiceId || !employeeId ? (
            <p className="text-[13px] text-muted">
              خدمت و پرسنل را انتخاب کنید تا ساعات آزاد نمایش داده شود.
            </p>
          ) : shownSlotsStatus === "loading" ? (
            <div className="flex items-center gap-2 py-3 text-[13px] text-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              در حال دریافت ساعات آزاد…
            </div>
          ) : shownSlotsStatus === "error" ? (
            <AuthError message={shownSlotsError ?? "خطا در دریافت ساعات."} />
          ) : shownSlots.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-surface-secondary/60 px-3 py-3 text-[13px] text-muted">
              برای این تاریخ ساعت آزادی وجود ندارد.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {shownSlots.map((slot) => {
                const active = slot.startTime === slotStart;
                return (
                  <button
                    key={slot.startTime}
                    type="button"
                    onClick={() => setSlotStart(slot.startTime)}
                    className={cn(
                      "inline-flex h-10 items-center justify-center rounded-xl border text-[13px] font-bold tabular-nums transition-colors",
                      active
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-surface text-text-primary hover:border-border-strong hover:bg-surface-secondary",
                    )}
                  >
                    {formatSlotLabel(slot.startTime)}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Summary */}
        {selectedService ? (
          <section className="rounded-xl border border-border-subtle bg-surface-secondary/70 p-3.5">
            <p className="mb-2 text-[12px] font-bold text-muted">خلاصه رزرو</p>
            <ul className="space-y-1.5 text-[13px] text-text-primary">
              <li className="flex items-center justify-between gap-2">
                <span className="text-muted">خدمت</span>
                <span className="font-bold">{selectedService.title}</span>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span className="text-muted">پرسنل</span>
                <span className="font-bold">
                  {selectedEmployee?.fullName ?? "—"}
                </span>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span className="text-muted">تاریخ</span>
                <span className="font-bold">
                  {formatJalaliDate(date)}
                </span>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span className="text-muted">ساعت</span>
                <span className="font-bold tabular-nums">
                  {slotStart ? formatSlotLabel(slotStart) : "—"}
                </span>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span className="text-muted">قیمت</span>
                <span className="font-bold">
                  {displayPrice != null
                    ? formatPrice(displayPrice)
                    : formatPrice(selectedService.price)}
                </span>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span className="text-muted">مدت</span>
                <span className="font-bold">
                  {displayDuration != null
                    ? formatDuration(displayDuration)
                    : formatDuration(selectedService.durationMinutes)}
                </span>
              </li>
            </ul>
            <p className="mt-2 text-[11px] leading-5 text-muted">
              {selectedAssignment
                ? "قیمت و مدت بر اساس تعرفهٔ پرسنل انتخاب‌شده است."
                : "پس از انتخاب پرسنل، قیمت و مدت مؤثر نمایش داده می‌شود."}
            </p>
          </section>
        ) : null}

        {/* Guest fields */}
        {!isAuthenticated ? (
          <section className="space-y-3">
            <p className="text-[12px] font-bold text-muted">
              اطلاعات مهمان
            </p>
            <Input
              label="نام"
              requiredMark
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              error={guestFieldErrors.name}
              autoComplete="name"
            />
            <Input
              label="شماره موبایل"
              requiredMark
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              error={guestFieldErrors.phoneNumber}
              inputMode="tel"
              autoComplete="tel"
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            />
          </section>
        ) : null}

        {submitError ? <AuthError message={submitError} /> : null}

        <Button
          type="button"
          disabled={!canSubmit}
          onClick={() => void handleSubmit()}
          className="h-12 w-full rounded-xl bg-primary text-[14px] font-bold text-white hover:bg-primary-hover"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              در حال ثبت…
            </>
          ) : (
            <>
              <CalendarDays className="h-4 w-4" strokeWidth={1.75} />
              ثبت رزرو نوبت
            </>
          )}
        </Button>

        {selectedService ? (
          <p className="flex items-center justify-center gap-1.5 text-center text-[12px] text-muted">
            <Clock3 className="h-3.5 w-3.5" strokeWidth={1.75} />
            {formatDuration(
              displayDuration ?? selectedService.durationMinutes,
            )}{" "}
            ·{" "}
            {formatPrice(displayPrice ?? selectedService.price)}
          </p>
        ) : null}
      </div>
    </aside>
  );
}
