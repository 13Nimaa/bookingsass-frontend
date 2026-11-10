"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Eye,
  Heart,
  Search,
} from "lucide-react";
import { cn } from "cn";
import { AuthError } from "@/components/shared/auth-error";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  formatBookingDate,
  formatBookingTime,
} from "@/features/booking/lib/format";
import {
  BOOKING_STATUS_LABELS,
  bookingStatusBadgeClass,
} from "@/features/booking/lib/status";
import { BookingStatus } from "@/features/booking/types";
import type { CustomerDashboardBookingItemDto } from "@/features/customer/types";
import { useCustomerDashboardStore } from "@/features/customer/store/customer-dashboard-store";
import { useProfileStore } from "@/features/profile/store/profile-store";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1600334129128-685c5589c53d?auto=format&fit=crop&w=640&q=80";

const CUSTOMER_STATUS_LABELS: Record<BookingStatus, string> = {
  ...BOOKING_STATUS_LABELS,
  [BookingStatus.Pending]: "در انتظار تأیید",
};

function firstName(fullName: string | undefined): string {
  const trimmed = fullName?.trim();
  if (!trimmed) return "کاربر";
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

function userInitials(name: string | undefined): string {
  if (!name?.trim()) return "؟";
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((p) => p[0]!).join("");
}

function statusBadgeClass(status: number): string {
  if (status === BookingStatus.Pending) {
    return "bg-info-soft text-info-text";
  }
  return bookingStatusBadgeClass(status as BookingStatus);
}

function statusLabel(status: number): string {
  return (
    CUSTOMER_STATUS_LABELS[status as BookingStatus] ??
    BOOKING_STATUS_LABELS[status as BookingStatus] ??
    "—"
  );
}

function formatCustomerBookingDate(iso: string): string {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Tehran",
  }).format(new Date(iso));
}

function canCancelBooking(item: CustomerDashboardBookingItemDto): boolean {
  if (
    item.status !== BookingStatus.Pending &&
    item.status !== BookingStatus.Confirmed
  ) {
    return false;
  }
  return new Date(item.startTime).getTime() > Date.now();
}

function imageUrl(url: string | null): string | null {
  return url?.trim() ? url : null;
}

function StatCard({
  label,
  value,
  icon,
  iconClass,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  iconClass: string;
}) {
  return (
    <article className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:gap-3.5 sm:p-5">
      <span
        aria-hidden="true"
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          iconClass,
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[12px] font-medium leading-5 text-muted sm:text-[12.5px]">
          {label}
        </p>
        <p className="mt-0.5 text-[22px] font-semibold leading-7 tracking-tight text-text-primary tabular-nums sm:text-2xl">
          {value}
        </p>
      </div>
    </article>
  );
}

function UpcomingBookingCard({
  booking,
  onCancel,
}: {
  booking: CustomerDashboardBookingItemDto;
  onCancel: (booking: CustomerDashboardBookingItemDto) => void;
}) {
  const img = imageUrl(booking.businessProfileImageUrl);
  const showCancel = canCancelBooking(booking);

  return (
    <article className="rounded-2xl border border-border bg-surface p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
              statusBadgeClass(booking.status),
            )}
          >
            {statusLabel(booking.status)}
          </span>

          <h3 className="mt-3 truncate text-[15px] font-bold text-text-primary sm:text-base">
            {booking.businessName}
          </h3>

          <p className="mt-1.5 text-[13px] text-muted">{booking.serviceName}</p>
          <p className="mt-0.5 text-[12px] text-muted">{booking.employeeName}</p>
          <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-muted">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>
              {formatCustomerBookingDate(booking.startTime)}،{" "}
              {formatBookingTime(booking.startTime)}
            </span>
          </p>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <Link
              href={`/businesses/${booking.businessId}`}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-primary bg-surface px-4 text-[13px] font-semibold text-primary transition-colors duration-150 hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              جزئیات
            </Link>
            {showCancel ? (
              <button
                type="button"
                onClick={() => onCancel(booking)}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 text-[13px] font-medium text-muted transition-colors duration-150 hover:bg-surface-secondary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                لغو رزرو
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-surface-secondary sm:h-28 sm:w-28">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt="" className="h-full w-full object-cover" />
          ) : (
            <Heart className="h-8 w-8 text-border-strong" aria-hidden="true" />
          )}
        </div>
      </div>
    </article>
  );
}

function RecentBookingsTable({
  items,
}: {
  items: CustomerDashboardBookingItemDto[];
}) {
  if (items.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-border bg-surface px-5 py-10 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <h2 className="text-[15px] font-bold text-text-primary">رزروهای اخیر</h2>
        <p className="mt-2 text-[13px] text-muted">هنوز رزروی ثبت نشده است.</p>
        <Link
          href="/businesses"
          className="mt-4 inline-flex text-[13px] font-semibold text-primary hover:text-primary-hover"
        >
          مشاهده سالن‌ها
        </Link>
      </section>
    );
  }

  return (
    <section
      id="recent-bookings"
      className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
    >
      <div className="border-b border-border px-4 py-4 sm:px-5">
        <h2 className="text-[15px] font-bold text-text-primary sm:text-base">
          رزروهای اخیر
        </h2>
      </div>

      <ul className="divide-y divide-border md:hidden">
        {items.map((item) => {
          const img = imageUrl(item.businessProfileImageUrl);
          return (
            <li key={item.id} className="flex gap-3 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-secondary">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Heart
                    className="h-5 w-5 text-border-strong"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-[13.5px] font-semibold text-text-primary">
                    {item.businessName}
                  </p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold",
                      statusBadgeClass(item.status),
                    )}
                  >
                    {statusLabel(item.status)}
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] text-muted">{item.serviceName}</p>
                <p className="mt-1 text-[11.5px] text-muted">
                  {formatBookingDate(item.startTime)} —{" "}
                  {formatBookingTime(item.startTime)}
                </p>
                <Link
                  href={`/businesses/${item.businessId}`}
                  className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary"
                >
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  مشاهده
                </Link>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] border-collapse text-start">
          <thead>
            <tr className="bg-surface-subtle text-[12px] font-semibold text-muted">
              <th className="px-5 py-3 text-start font-semibold">سالن</th>
              <th className="px-4 py-3 text-start font-semibold">خدمت</th>
              <th className="px-4 py-3 text-start font-semibold">تاریخ و ساعت</th>
              <th className="px-4 py-3 text-start font-semibold">وضعیت</th>
              <th className="px-5 py-3 text-start font-semibold">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const img = imageUrl(item.businessProfileImageUrl);
              return (
                <tr
                  key={item.id}
                  className="border-t border-border text-[13px] text-text-primary"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-secondary">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Heart
                            className="h-4 w-4 text-border-strong"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <span className="font-semibold">{item.businessName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted">{item.serviceName}</td>
                  <td className="px-4 py-3.5 text-muted tabular-nums">
                    {formatBookingDate(item.startTime)}
                    <span className="mx-1 text-border-strong">|</span>
                    {formatBookingTime(item.startTime)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                        statusBadgeClass(item.status),
                      )}
                    >
                      {statusLabel(item.status)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/businesses/${item.businessId}`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-[12.5px] font-medium text-muted transition-colors duration-150 hover:bg-surface-secondary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      مشاهده
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-5 sm:gap-6" aria-busy="true">
      <div className="h-10 w-48 animate-pulse rounded-full bg-surface-secondary" />
      <div className="h-44 animate-pulse rounded-[1.75rem] bg-surface-secondary sm:h-52" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-2xl bg-surface-secondary"
          />
        ))}
      </div>
      <div className="h-40 animate-pulse rounded-2xl bg-surface-secondary" />
      <div className="h-56 animate-pulse rounded-2xl bg-surface-secondary" />
    </div>
  );
}

export function CustomerHomeDashboard() {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const profileStatus = useProfileStore((s) => s.status);
  const fetchProfile = useProfileStore((s) => s.fetchProfile);

  const data = useCustomerDashboardStore((s) => s.data);
  const status = useCustomerDashboardStore((s) => s.status);
  const error = useCustomerDashboardStore((s) => s.error);
  const cancellingId = useCustomerDashboardStore((s) => s.cancellingId);
  const cancelError = useCustomerDashboardStore((s) => s.cancelError);
  const fetchDashboard = useCustomerDashboardStore((s) => s.fetchDashboard);
  const cancelBooking = useCustomerDashboardStore((s) => s.cancelBooking);
  const clearCancelError = useCustomerDashboardStore((s) => s.clearCancelError);

  const [query, setQuery] = useState("");
  const [cancelTarget, setCancelTarget] =
    useState<CustomerDashboardBookingItemDto | null>(null);

  useEffect(() => {
    if (profileStatus === "idle") void fetchProfile();
  }, [profileStatus, fetchProfile]);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const displayName = profile?.fullName?.trim() || "کاربر";
  const greetName = firstName(profile?.fullName);

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    router.push(q ? `/businesses?search=${encodeURIComponent(q)}` : "/businesses");
  };

  const onConfirmCancel = async () => {
    if (!cancelTarget) return;
    const ok = await cancelBooking(cancelTarget.id);
    if (ok) setCancelTarget(null);
  };

  if (status === "idle" || status === "loading") {
    return <HomeSkeleton />;
  }

  if (status === "error" || !data) {
    return (
      <div className="flex flex-col gap-3">
        <AuthError message={error ?? "دریافت داشبورد ممکن نشد."} />
        <Button
          type="button"
          variant="outline"
          className="self-start"
          onClick={() => void fetchDashboard()}
        >
          تلاش دوباره
        </Button>
      </div>
    );
  }

  const { summary, upcomingBookings, recentBookings } = data;

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-[13px] font-bold text-primary"
          >
            {profile?.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.profileImageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              userInitials(displayName)
            )}
          </span>
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-1 text-[13.5px] font-semibold text-text-primary"
          >
            {displayName}
            <ChevronDown className="h-4 w-4 text-muted" aria-hidden="true" />
          </Link>
        </div>
        {/* Notification badge omitted — not in customer dashboard API */}
        <button
          type="button"
          aria-label="اعلان‌ها"
          disabled
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-muted opacity-60"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
        </button>
      </header>

      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-l from-primary via-primary to-primary-hover text-primary-foreground">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 10% 50%, rgba(255,255,255,0.35), transparent 60%)",
          }}
        />
        <div className="relative grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8 sm:p-7 md:p-8">
          <div className="min-w-0">
            <h1 className="text-[20px] font-bold leading-8 tracking-tight sm:text-[22px] md:text-[24px]">
              سلام {greetName}! به داشبورد خودت خوش اومدی
            </h1>
            <p className="mt-1.5 max-w-md text-[13px] leading-6 text-primary-foreground/85 sm:text-[13.5px]">
              سالن مورد علاقه‌ات را پیدا کن و نوبت بعدی‌ات را رزرو کن.
            </p>

            <form
              onSubmit={onSearch}
              className="mt-4 flex max-w-md items-center gap-2 rounded-2xl bg-surface p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.12)] sm:mt-5"
            >
              <label className="sr-only" htmlFor="customer-salon-search">
                جستجو در سالن‌ها
              </label>
              <div className="flex min-w-0 flex-1 items-center gap-2 px-2.5">
                <Search
                  className="h-4 w-4 shrink-0 text-muted"
                  aria-hidden="true"
                />
                <input
                  id="customer-salon-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="جستجو در سالن‌ها..."
                  className="h-10 w-full min-w-0 bg-transparent text-[13.5px] text-text-primary outline-none placeholder:text-text-disabled"
                />
              </div>
              <button
                type="submit"
                className="hidden h-10 shrink-0 rounded-xl bg-primary px-4 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover sm:inline-flex sm:items-center"
              >
                جستجو
              </button>
            </form>
          </div>

          <div className="relative mx-auto h-36 w-full max-w-[220px] overflow-hidden rounded-2xl sm:mx-0 sm:h-40 sm:w-[200px] md:h-44 md:w-[220px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={HERO_IMAGE}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section
        aria-label="خلاصه وضعیت"
        className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4"
      >
        <StatCard
          label="نوبت‌های پیش‌رو"
          value={summary.upcomingBookingsCount.toLocaleString("fa-IR")}
          icon={<CalendarDays className="h-5 w-5" strokeWidth={1.75} />}
          iconClass="bg-primary-soft text-primary"
        />
        <StatCard
          label="کل رزروها"
          value={summary.totalBookingsCount.toLocaleString("fa-IR")}
          icon={<Check className="h-5 w-5" strokeWidth={2} />}
          iconClass="bg-success-soft text-success"
        />
        <StatCard
          label="سالن‌های مورد علاقه"
          value={summary.favoriteSalonsCount.toLocaleString("fa-IR")}
          icon={<Heart className="h-5 w-5" strokeWidth={1.75} />}
          iconClass="bg-error-soft text-error"
        />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-[15px] font-bold text-text-primary sm:text-base">
            نوبت‌های پیش‌رو شما
          </h2>
          <Link
            href="/dashboard/my-bookings"
            className="text-[12.5px] font-semibold text-primary transition-colors hover:text-primary-hover"
          >
            مشاهده همه
            {upcomingBookings.totalCount > upcomingBookings.items.length
              ? ` (${upcomingBookings.totalCount.toLocaleString("fa-IR")})`
              : ""}
          </Link>
        </div>
        {upcomingBookings.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface px-5 py-8 text-center">
            <p className="text-[13px] text-muted">نوبت پیش‌رویی ندارید.</p>
            <Link
              href="/businesses"
              className="mt-3 inline-flex text-[13px] font-semibold text-primary hover:text-primary-hover"
            >
              رزرو نوبت جدید
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {upcomingBookings.items.map((booking) => (
              <UpcomingBookingCard
                key={booking.id}
                booking={booking}
                onCancel={(b) => {
                  clearCancelError();
                  setCancelTarget(b);
                }}
              />
            ))}
          </div>
        )}
      </section>

      <RecentBookingsTable items={recentBookings} />

      <ConfirmDialog
        open={cancelTarget != null}
        onOpenChange={(open) => {
          if (!open && cancellingId == null) {
            setCancelTarget(null);
            clearCancelError();
          }
        }}
        title="لغو رزرو"
        description={
          cancelTarget
            ? `آیا از لغو رزرو «${cancelTarget.serviceName}» در ${cancelTarget.businessName} مطمئن هستید؟`
            : ""
        }
        confirmLabel="لغو رزرو"
        cancelLabel="انصراف"
        tone="danger"
        loading={cancellingId != null}
        error={cancelError}
        onConfirm={() => void onConfirmCancel()}
      />
    </div>
  );
}
