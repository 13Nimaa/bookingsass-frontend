"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  MapPin,
  Navigation,
  Scissors,
  Share2,
} from "lucide-react";
import { cn } from "cn";
import { AuthError } from "@/components/shared/auth-error";
import { Navbar } from "@/components/layout/navbar";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { SalonGallery } from "@/features/business/components/salon-gallery";
import {
  SalonBookingPanel,
  type PublicEmployeeOption,
} from "@/features/business/components/salon-booking-panel";
import type {
  BusinessDto,
  PublicEmployeeDto,
  PublicWorkingHourDto,
} from "@/features/business/types";
import type { ServiceDto } from "@/features/service/types";
import { formatDuration, formatPrice } from "@/features/employee/lib/format";
import { formatGregorianIsoToJalali } from "@/features/employee/lib/jalali-date";
import { toTimeInput } from "@/features/employee/lib/schedule";

const SECTION_TABS = [
  { id: "about", label: "اطلاعات سالن" },
  { id: "services", label: "خدمات" },
  { id: "staff", label: "پرسنل" },
  { id: "hours", label: "ساعات کاری" },
] as const;

type SectionId = (typeof SECTION_TABS)[number]["id"];

function galleryImages(business: BusinessDto): string[] {
  const fromGallery = (business.businessGallery ?? [])
    .map((item) => item.url?.trim())
    .filter((url): url is string => Boolean(url));
  if (fromGallery.length > 0) return fromGallery;

  const urls: string[] = [];
  if (business.coverImageUrl?.trim()) urls.push(business.coverImageUrl.trim());
  if (business.profileImageUrl?.trim()) {
    const profile = business.profileImageUrl.trim();
    if (!urls.includes(profile)) urls.push(profile);
  }
  return urls;
}

function locationLabel(business: BusinessDto): string {
  const city = business.city?.trim() ?? "";
  const neighborhood = business.neighborhood?.trim() ?? "";
  const address = business.address?.trim() ?? "";
  if (city && neighborhood) return `${city}، ${neighborhood}`;
  if (city && address) {
    const short = address.length > 48 ? `${address.slice(0, 48)}…` : address;
    return `${city}، ${short}`;
  }
  return city || address || "موقعیت ثبت نشده";
}

function mapsUrl(business: BusinessDto): string | null {
  const q = [business.address, business.city].filter(Boolean).join("، ");
  if (!q.trim()) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

function formatPersianClock(value: string) {
  return toTimeInput(value).replace(
    /\d/g,
    (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)],
  );
}

function toBookingEmployees(
  employees: PublicEmployeeDto[],
): PublicEmployeeOption[] {
  return employees.map((employee) => ({
    id: employee.id,
    fullName: employee.fullName,
    avatarUrl: employee.avatarUrl,
    services: employee.services.map((service) => ({
      id: service.id,
      title: service.title,
      effectivePrice: service.effectivePrice,
      effectiveDurationMinutes: service.effectiveDurationMinutes,
    })),
  }));
}

type HourRow = PublicWorkingHourDto & { employeeName: string };

function collectWorkingHours(employees: PublicEmployeeDto[]): HourRow[] {
  return employees.flatMap((employee) =>
    employee.workingHours.map((hour) => ({
      ...hour,
      employeeName: employee.fullName,
    })),
  );
}

function groupHoursByDate(hours: HourRow[]): Map<string, HourRow[]> {
  const map = new Map<string, HourRow[]>();
  for (const hour of hours) {
    const list = map.get(hour.date) ?? [];
    list.push(hour);
    map.set(hour.date, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }
  return map;
}

function todayIsoLocal() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function openStatusLabel(
  business: BusinessDto,
  hours: HourRow[],
): { open: boolean; label: string } | null {
  if (business.isOpen === true) {
    const today = todayIsoLocal();
    const todayHours = hours.filter((h) => h.date === today);
    if (todayHours.length > 0) {
      const latest = [...todayHours].sort((a, b) =>
        b.endTime.localeCompare(a.endTime),
      )[0];
      return {
        open: true,
        label: `باز تا ${formatPersianClock(latest.endTime)}`,
      };
    }
    return { open: true, label: "باز است" };
  }
  if (business.isOpen === false) {
    return { open: false, label: "فعلاً بسته" };
  }
  return null;
}

interface SalonDetailPageProps {
  business: BusinessDto;
  services: ServiceDto[];
  servicesFailed: boolean;
  employees: PublicEmployeeDto[];
}

export function SalonDetailPage({
  business,
  services,
  servicesFailed,
  employees,
}: SalonDetailPageProps) {
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = React.useState<SectionId>("about");
  const [selectedServiceId, setSelectedServiceId] = React.useState<number | null>(
    null,
  );
  const [shareHint, setShareHint] = React.useState(false);

  const images = galleryImages(business);
  const description = business.description?.trim() || null;
  const bookingEmployees = React.useMemo(
    () => toBookingEmployees(employees),
    [employees],
  );
  const workingHourRows = React.useMemo(
    () => collectWorkingHours(employees),
    [employees],
  );
  const hoursByDate = React.useMemo(
    () => groupHoursByDate(workingHourRows),
    [workingHourRows],
  );
  const hourDates = React.useMemo(
    () => [...hoursByDate.keys()].sort(),
    [hoursByDate],
  );
  const status = openStatusLabel(business, workingHourRows);
  const directionsHref = mapsUrl(business);
  const avatarSrc =
    business.profileImageUrl?.trim() ||
    business.ownerAvatarUrl?.trim() ||
    null;

  const scrollToBooking = () => {
    document
      .getElementById("salon-booking-panel")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: business.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareHint(true);
      window.setTimeout(() => setShareHint(false), 2000);
    } catch {
      /* user cancelled share */
    }
  };

  const panelMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -6 },
      };

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 pb-28 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pb-16">
        <Link
          href="/businesses"
          className="mb-3 hidden items-center gap-1.5 text-[13px] font-medium text-muted transition-colors hover:text-text-primary sm:inline-flex"
        >
          <ArrowLeft className="h-3.5 w-3.5 rotate-180" strokeWidth={1.75} />
          بازگشت به سالن‌ها
        </Link>

        <SalonGallery images={images} salonName={business.name} />

        <Link
          href="/businesses"
          className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition-colors hover:text-text-primary sm:hidden"
        >
          <ArrowLeft className="h-3.5 w-3.5 rotate-180" strokeWidth={1.75} />
          بازگشت به سالن‌ها
        </Link>

        {/* Title / meta row under gallery */}
        <header className="mt-4 flex flex-col gap-4 border-b border-border-subtle pb-6 sm:mt-7 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-primary-soft text-[22px] font-extrabold text-primary shadow-sm sm:h-[4.5rem] sm:w-[4.5rem] sm:text-[26px]">
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarSrc}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                business.name.trim().charAt(0) || "س"
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-[28px] leading-9 font-extrabold tracking-tight text-balance text-text-primary sm:text-[34px] sm:leading-[2.75rem]">
                  {business.name}
                </h1>
                {status ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold",
                      status.open
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700",
                    )}
                  >
                    {status.open ? (
                      <Check className="h-3 w-3" strokeWidth={2.25} />
                    ) : null}
                    {status.label}
                  </span>
                ) : null}
              </div>
              <p className="mt-1.5 flex items-start gap-1.5 text-[13px] leading-6 text-muted">
                <MapPin
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  strokeWidth={1.75}
                />
                <span>{locationLabel(business)}</span>
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {directionsHref ? (
              <a
                href={directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 text-[13px] font-bold text-text-primary transition-[background-color,transform] duration-150 hover:bg-surface-secondary active:scale-[0.97] motion-reduce:active:scale-100"
              >
                <Navigation className="h-3.5 w-3.5" strokeWidth={1.75} />
                مسیریابی
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => void handleShare()}
              className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 text-[13px] font-bold text-text-primary transition-[background-color,transform] duration-150 hover:bg-surface-secondary active:scale-[0.97] motion-reduce:active:scale-100"
            >
              <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              {shareHint ? "کپی شد" : "اشتراک‌گذاری"}
            </button>
          </div>
        </header>

        {/* Body: booking + tabbed content */}
        <div className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-[minmax(300px,34%)_minmax(0,1fr)] lg:items-start lg:gap-10">
          <div className="order-2 lg:order-1 lg:sticky lg:top-6 lg:self-start">
            <SalonBookingPanel
              businessId={business.id}
              services={services}
              employees={bookingEmployees}
              selectedServiceId={selectedServiceId}
              onSelectService={setSelectedServiceId}
            />
          </div>

          <div className="order-1 min-w-0 lg:order-2">
            <nav
              aria-label="بخش‌های صفحه سالن"
              className="sticky top-0 z-10 -mx-4 border-b border-border-subtle bg-background/80 px-4 backdrop-blur-xl sm:mx-0 sm:px-0"
            >
              <div
                role="tablist"
                className="flex gap-1 overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {SECTION_TABS.map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      id={`tab-${tab.id}`}
                      aria-controls={`panel-${tab.id}`}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "relative shrink-0 cursor-pointer px-3.5 py-3 text-[13px] font-bold transition-colors duration-150",
                        active
                          ? "text-primary"
                          : "text-muted hover:text-text-primary",
                      )}
                    >
                      {tab.label}
                      {active ? (
                        <motion.span
                          layoutId={reduceMotion ? undefined : "salon-tab-underline"}
                          className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary"
                          transition={{
                            type: "spring",
                            bounce: 0,
                            duration: 0.35,
                          }}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </nav>

            <div className="relative mt-6 min-h-[220px]">
              <AnimatePresence mode="wait" initial={false}>
                {activeTab === "about" ? (
                  <motion.section
                    key="about"
                    role="tabpanel"
                    id="panel-about"
                    aria-labelledby="tab-about"
                    className="outline-none"
                    {...panelMotion}
                    transition={{ type: "spring", bounce: 0, duration: 0.35 }}
                  >
                    <h2 className="mb-3 text-[18px] font-bold text-text-primary">
                      درباره سالن
                    </h2>
                    {description ? (
                      <p className="max-w-2xl text-[15px] leading-8 text-muted">
                        {description}
                      </p>
                    ) : (
                      <p className="text-[14px] text-muted">
                        توضیحی برای این سالن ثبت نشده است.
                      </p>
                    )}
                    {business.address?.trim() ? (
                      <p className="mt-4 flex items-start gap-2 text-[13px] leading-6 text-muted">
                        <MapPin
                          className="mt-0.5 h-3.5 w-3.5 shrink-0"
                          strokeWidth={1.75}
                        />
                        <span>
                          {business.city?.trim()
                            ? `${business.city.trim()}، `
                            : ""}
                          {business.address.trim()}
                        </span>
                      </p>
                    ) : null}
                  </motion.section>
                ) : null}

                {activeTab === "services" ? (
                  <motion.section
                    key="services"
                    role="tabpanel"
                    id="panel-services"
                    aria-labelledby="tab-services"
                    className="outline-none"
                    {...panelMotion}
                    transition={{ type: "spring", bounce: 0, duration: 0.35 }}
                  >
                    <h2 className="mb-4 text-[18px] font-bold text-text-primary">
                      خدمات
                    </h2>
                    {servicesFailed ? (
                      <AuthError message="دریافت فهرست خدمات ممکن نشد." />
                    ) : services.length === 0 ? (
                      <p className="rounded-2xl border border-dashed border-border bg-surface-secondary/50 px-4 py-6 text-[14px] text-muted">
                        خدمتی برای این سالن ثبت نشده است.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {services.map((service) => {
                          const active = service.id === selectedServiceId;
                          return (
                            <div
                              key={service.id}
                              className={cn(
                                "flex items-center gap-3 rounded-2xl border bg-surface p-4 transition-colors",
                                active
                                  ? "border-primary bg-primary-soft/50"
                                  : "border-border",
                              )}
                            >
                              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-secondary text-muted">
                                <Scissors
                                  className="h-4 w-4"
                                  strokeWidth={1.75}
                                />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-[14px] font-bold text-text-primary">
                                  {service.title}
                                </p>
                                <p className="mt-0.5 text-[12px] text-muted">
                                  {formatDuration(service.durationMinutes)}
                                </p>
                              </div>
                              <div className="flex shrink-0 flex-col items-end gap-2">
                                <span className="text-[13px] font-bold tabular-nums text-text-primary">
                                  {formatPrice(service.price)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedServiceId(service.id);
                                    scrollToBooking();
                                  }}
                                  className={cn(
                                    "inline-flex h-9 cursor-pointer items-center rounded-xl px-3.5 text-[12px] font-bold transition-[transform,background-color] duration-150 active:scale-[0.97] motion-reduce:active:scale-100",
                                    active
                                      ? "bg-primary text-white hover:bg-primary-hover"
                                      : "bg-primary-soft text-primary hover:bg-primary-subtle",
                                  )}
                                >
                                  انتخاب
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.section>
                ) : null}

                {activeTab === "staff" ? (
                  <motion.section
                    key="staff"
                    role="tabpanel"
                    id="panel-staff"
                    aria-labelledby="tab-staff"
                    className="outline-none"
                    {...panelMotion}
                    transition={{ type: "spring", bounce: 0, duration: 0.35 }}
                  >
                    <h2 className="mb-4 text-[18px] font-bold text-text-primary">
                      پرسنل سالن
                    </h2>
                    {employees.length === 0 ? (
                      <p className="rounded-2xl border border-dashed border-border bg-surface-secondary/50 px-4 py-6 text-[14px] text-muted">
                        پرسنلی برای نمایش ثبت نشده است.
                      </p>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {employees.map((employee) => (
                          <div
                            key={employee.id}
                            className="flex gap-3 rounded-2xl border border-border bg-surface p-4"
                          >
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-secondary text-[15px] font-bold text-muted">
                              {employee.avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={employee.avatarUrl}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                employee.fullName.trim().charAt(0) || "؟"
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[14px] font-bold text-text-primary">
                                {employee.fullName}
                              </p>
                              {employee.services.length > 0 ? (
                                <p className="mt-1.5 line-clamp-2 text-[12px] leading-5 text-muted">
                                  {employee.services
                                    .map((s) => s.title)
                                    .join("، ")}
                                </p>
                              ) : (
                                <p className="mt-1.5 text-[12px] text-muted">
                                  خدمتی به این پرسنل اختصاص داده نشده است.
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.section>
                ) : null}

                {activeTab === "hours" ? (
                  <motion.section
                    key="hours"
                    role="tabpanel"
                    id="panel-hours"
                    aria-labelledby="tab-hours"
                    className="outline-none"
                    {...panelMotion}
                    transition={{ type: "spring", bounce: 0, duration: 0.35 }}
                  >
                    <h2 className="mb-4 text-[18px] font-bold text-text-primary">
                      ساعات کاری
                    </h2>
                    {hourDates.length === 0 ? (
                      <p className="rounded-2xl border border-dashed border-border bg-surface-secondary/50 px-4 py-6 text-[14px] text-muted">
                        ساعت کاری برای روزهای آینده ثبت نشده است.
                      </p>
                    ) : (
                      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                        <ul className="divide-y divide-border-subtle">
                          {hourDates.map((date) => {
                            const rows = hoursByDate.get(date) ?? [];
                            const span =
                              rows.length > 0
                                ? `${formatPersianClock(rows[0].startTime)} – ${formatPersianClock(
                                    [...rows].sort((a, b) =>
                                      b.endTime.localeCompare(a.endTime),
                                    )[0].endTime,
                                  )}`
                                : "—";
                            return (
                              <li
                                key={date}
                                className="flex items-center justify-between gap-3 px-4 py-3.5"
                              >
                                <span className="text-[13px] font-bold text-text-primary">
                                  {formatGregorianIsoToJalali(date, {
                                    includeWeekday: true,
                                  })}
                                </span>
                                <span className="text-[13px] font-medium tabular-nums text-muted">
                                  {span}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </motion.section>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-[74px] z-20 border-t border-border bg-surface/95 p-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={scrollToBooking}
          className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary text-[14px] font-bold text-white transition-[background-color,transform] duration-150 hover:bg-primary-hover active:scale-[0.98]"
        >
          <CalendarDays className="h-4 w-4" strokeWidth={1.75} />
          رزرو نوبت
        </button>
      </div>

      <MobileTabBar />
    </div>
  );
}

export function SalonDetailSkeleton() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <Navbar />
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="skeleton-shimmer mb-6 h-[280px] w-full rounded-2xl bg-surface-secondary sm:h-[360px] lg:h-[440px]" />
        <div className="mb-8 flex gap-4">
          <div className="skeleton-shimmer h-16 w-16 rounded-2xl bg-surface-secondary sm:h-[4.5rem] sm:w-[4.5rem]" />
          <div className="space-y-2">
            <div className="skeleton-shimmer h-9 w-56 rounded-lg bg-surface-secondary sm:h-10" />
            <div className="skeleton-shimmer h-4 w-64 max-w-full rounded bg-surface-secondary" />
          </div>
        </div>
        <div className="grid gap-8 lg:grid-cols-[34%_1fr]">
          <div className="skeleton-shimmer h-96 rounded-[1.5rem] bg-surface-secondary" />
          <div className="space-y-4">
            <div className="skeleton-shimmer h-10 w-full rounded-lg bg-surface-secondary" />
            <div className="skeleton-shimmer h-40 w-full rounded-lg bg-surface-secondary" />
          </div>
        </div>
      </div>
      <MobileTabBar />
    </div>
  );
}

export function SalonDetailNotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <Navbar />
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-[22px] font-bold text-text-primary">سالن پیدا نشد</h1>
        <p className="mt-2 text-[14px] leading-7 text-muted">
          این سالن وجود ندارد یا حذف شده است.
        </p>
        <Link
          href="/businesses"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-[13px] font-bold text-white hover:bg-primary-hover"
        >
          بازگشت به فهرست سالن‌ها
        </Link>
      </div>
      <MobileTabBar />
    </div>
  );
}

export function SalonDetailFailed() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <Navbar />
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <AuthError message="دریافت اطلاعات سالن ممکن نشد. لطفاً دوباره تلاش کنید." />
        <Link
          href="/businesses"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-5 text-[13px] font-medium text-text-primary hover:bg-surface-secondary"
        >
          بازگشت به فهرست سالن‌ها
        </Link>
      </div>
      <MobileTabBar />
    </div>
  );
}
