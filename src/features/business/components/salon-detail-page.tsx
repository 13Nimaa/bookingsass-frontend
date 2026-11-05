"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Flower2,
  MapPin,
  Scissors,
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

function categoryTags(business: BusinessDto): string[] {
  if (!Array.isArray(business.services)) return [];
  return business.services
    .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
    .filter(Boolean)
    .slice(0, 6);
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
  const [activeTab, setActiveTab] = React.useState<SectionId>("about");
  const [selectedServiceId, setSelectedServiceId] = React.useState<number | null>(
    null,
  );

  const images = galleryImages(business);
  const tags = categoryTags(business);
  const description = business.description?.trim() || null;
  const popular = services.slice(0, 6);
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

  const scrollToSection = (id: SectionId) => {
    setActiveTab(id);
    const el = document.getElementById(`section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToBooking = () => {
    document
      .getElementById("salon-booking-panel")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible?.target?.id) return;
        const id = visible.target.id.replace("section-", "") as SectionId;
        if (SECTION_TABS.some((tab) => tab.id === id)) {
          setActiveTab(id);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0.15, 0.35, 0.55] },
    );
    for (const tab of SECTION_TABS) {
      const el = document.getElementById(`section-${tab.id}`);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pb-16">
        <Link
          href="/businesses"
          className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5 rotate-180" strokeWidth={1.75} />
          بازگشت به سالن‌ها
        </Link>

        {/* Hero: info (start/right in RTL) + gallery */}
        <section className="grid gap-6 lg:grid-cols-2 lg:gap-8 lg:items-start">
          <div className="order-2 lg:order-1">
            <p className="mb-3 flex items-center gap-2 text-[13px] font-medium text-muted">
              <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              <span>{locationLabel(business)}</span>
            </p>

            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Flower2 className="h-5 w-5" strokeWidth={1.6} />
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-[28px] leading-10 font-bold text-balance text-text-primary sm:text-[32px] sm:leading-[2.75rem]">
                  {business.name}
                </h1>
              </div>
            </div>

            {description ? (
              <p className="mt-4 max-w-xl text-[15px] leading-8 text-muted">
                {description.length > 180
                  ? `${description.slice(0, 180)}…`
                  : description}
              </p>
            ) : null}

            {tags.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-surface-secondary px-3 py-1.5 text-[12px] font-medium text-text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="order-1 lg:order-2">
            <SalonGallery images={images} salonName={business.name} />
          </div>
        </section>

        {/* Section nav */}
        <nav
          aria-label="بخش‌های صفحه سالن"
          className="sticky top-0 z-10 -mx-4 mt-8 border-y border-border-subtle bg-background/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:mt-10 lg:border-0 lg:bg-transparent lg:px-0 lg:backdrop-blur-none"
        >
          <div className="flex gap-1 overflow-x-auto py-2 lg:border-b lg:border-border-subtle lg:py-0">
            {SECTION_TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => scrollToSection(tab.id)}
                  className={cn(
                    "shrink-0 border-b-2 px-3 py-2.5 text-[13px] font-bold transition-colors",
                    active
                      ? "border-primary text-primary"
                      : "border-transparent text-muted hover:text-text-primary",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Body: booking (start/right) + main content */}
        <div className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-[minmax(280px,28%)_minmax(0,1fr)] lg:items-start lg:gap-10">
          <div className="order-2 lg:order-1 lg:sticky lg:top-6 lg:self-start">
            <SalonBookingPanel
              businessId={business.id}
              services={services}
              employees={bookingEmployees}
              selectedServiceId={selectedServiceId}
              onSelectService={setSelectedServiceId}
            />
          </div>

          <div className="order-1 space-y-10 lg:order-2 lg:space-y-12">
            <section id="section-about" className="scroll-mt-24">
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
            </section>

            <section id="section-services" className="scroll-mt-24">
              <div className="mb-4 flex items-end justify-between gap-3">
                <h2 className="text-[18px] font-bold text-text-primary">
                  خدمات محبوب
                </h2>
                {services.length > popular.length ? (
                  <button
                    type="button"
                    onClick={() => {
                      document
                        .getElementById("salon-booking-panel")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-[13px] font-medium text-primary hover:underline"
                  >
                    مشاهده همه خدمات
                  </button>
                ) : null}
              </div>

              {servicesFailed ? (
                <AuthError message="دریافت فهرست خدمات ممکن نشد." />
              ) : popular.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border bg-surface-secondary/50 px-4 py-6 text-[14px] text-muted">
                  خدمتی برای این سالن ثبت نشده است.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {popular.map((service) => {
                    const active = service.id === selectedServiceId;
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => {
                          setSelectedServiceId(service.id);
                          scrollToBooking();
                        }}
                        className={cn(
                          "flex flex-col rounded-2xl border bg-surface p-4 text-right transition-colors",
                          active
                            ? "border-primary bg-primary-soft/60"
                            : "border-border hover:border-border-strong hover:bg-surface-secondary/60",
                        )}
                      >
                        <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-surface-secondary text-muted">
                          <Scissors className="h-4 w-4" strokeWidth={1.75} />
                        </span>
                        <span className="text-[14px] font-bold text-text-primary">
                          {service.title}
                        </span>
                        <span className="mt-1 text-[12px] text-muted">
                          {formatDuration(service.durationMinutes)}
                        </span>
                        <span className="mt-3 text-[13px] font-bold text-text-primary">
                          از {formatPrice(service.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            <section id="section-staff" className="scroll-mt-24">
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
                            {employee.services.map((s) => s.title).join("، ")}
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
            </section>

            <section id="section-hours" className="scroll-mt-24">
              <h2 className="mb-4 text-[18px] font-bold text-text-primary">
                ساعات کاری
              </h2>
              {hourDates.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border bg-surface-secondary/50 px-4 py-6 text-[14px] text-muted">
                  ساعت کاری برای روزهای آینده ثبت نشده است.
                </p>
              ) : (
                <div className="space-y-3">
                  {hourDates.map((date) => {
                    const rows = hoursByDate.get(date) ?? [];
                    return (
                      <div
                        key={date}
                        className="rounded-2xl border border-border bg-surface px-4 py-3"
                      >
                        <p className="text-[13px] font-bold text-text-primary">
                          {formatGregorianIsoToJalali(date, {
                            includeWeekday: true,
                          })}
                        </p>
                        <ul className="mt-2 space-y-1.5">
                          {rows.map((hour) => (
                            <li
                              key={hour.id}
                              className="flex flex-wrap items-center justify-between gap-2 text-[13px]"
                            >
                              <span className="text-muted">
                                {hour.employeeName}
                              </span>
                              <span className="font-medium tabular-nums text-text-primary">
                                {formatPersianClock(hour.startTime)} تا{" "}
                                {formatPersianClock(hour.endTime)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Mobile sticky booking CTA */}
      <div className="fixed inset-x-0 bottom-[74px] z-20 border-t border-border bg-surface/95 p-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={scrollToBooking}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[14px] font-bold text-white transition-colors hover:bg-primary-hover"
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
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="skeleton-shimmer h-4 w-40 rounded bg-surface-secondary" />
            <div className="skeleton-shimmer h-10 w-72 max-w-full rounded-lg bg-surface-secondary" />
            <div className="skeleton-shimmer h-20 w-full rounded-lg bg-surface-secondary" />
          </div>
          <div className="skeleton-shimmer aspect-[4/3] w-full rounded-[1.25rem] bg-surface-secondary" />
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-[28%_1fr]">
          <div className="skeleton-shimmer h-96 rounded-[1.5rem] bg-surface-secondary" />
          <div className="space-y-4">
            <div className="skeleton-shimmer h-6 w-32 rounded bg-surface-secondary" />
            <div className="skeleton-shimmer h-24 w-full rounded-lg bg-surface-secondary" />
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
