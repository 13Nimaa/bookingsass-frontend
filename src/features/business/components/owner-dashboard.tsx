"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  Gauge,
  Users,
  Wallet,
  ArrowLeft,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { AuthError } from "@/components/shared/auth-error";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import { useOwnerDashboardStore } from "@/features/business/store/owner-dashboard-store";
import {
  formatBookingPrice,
  formatBookingTime,
  formatBookingDate,
} from "@/features/booking/lib/format";
import { bookingStatusBadgeClass } from "@/features/booking/lib/status";
import {
  dashboardBookingStatusLabel,
  weekdayLabel,
} from "@/features/business/lib/dashboard-labels";
import type {
  BusinessDashboardDto,
  DashboardTodayBookingItemDto,
  WeeklyRevenuePointDto,
} from "@/features/business/types";
import { BookingStatus } from "@/features/booking/types";

const EASE = [0.16, 1, 0.3, 1] as const;

function formatCount(n: number): string {
  return n.toLocaleString("fa-IR");
}

function formatMoneyOrDash(value: number | null): string {
  if (value == null) return "—";
  return formatBookingPrice(value) ?? "—";
}

function customerDisplayName(name: string | null): string {
  const trimmed = name?.trim();
  return trimmed ? trimmed : "مشتری مهمان";
}

function initialOf(name: string): string {
  const part = name.trim().split(/\s+/)[0] ?? "";
  return part.charAt(0) || "؟";
}

function SummaryCard({
  label,
  value,
  unit,
  hint,
  icon: Icon,
  progress,
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  icon: LucideIcon;
  progress?: number | null;
}) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-surface p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-[11.5px] font-medium leading-5 text-muted sm:text-xs">
          {label}
        </p>
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary-soft text-primary"
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>
      <p className="mt-2 text-[18px] font-semibold leading-7 tracking-tight text-text-primary tabular-nums sm:text-xl">
        {value}
        {unit ? (
          <span className="ms-1 text-[11px] font-normal text-muted">{unit}</span>
        ) : null}
      </p>
      {progress != null ? (
        <div
          className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-primary-soft"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out motion-reduce:transition-none"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      ) : null}
      {hint ? (
        <p className="mt-2 text-[11px] leading-4 text-muted">{hint}</p>
      ) : null}
    </article>
  );
}

function WeeklyAreaChart({ points }: { points: WeeklyRevenuePointDto[] }) {
  const reduceMotion = useReducedMotion();
  const revenues = points.map((p) => p.estimatedRevenue);
  const max = Math.max(...revenues, 0);
  const sum = revenues.reduce((a, b) => a + b, 0);
  const peak =
    points.length === 0
      ? null
      : points.reduce((best, p) =>
          p.estimatedRevenue > best.estimatedRevenue ? p : best,
        );
  const allZero = max === 0;

  const w = 320;
  const h = 140;
  const padX = 8;
  const padY = 12;
  const chartW = w - padX * 2;
  const chartH = h - padY * 2;

  const coords = points.map((p, i) => {
    const x =
      points.length <= 1
        ? padX + chartW / 2
        : padX + (i / (points.length - 1)) * chartW;
    const ratio = allZero ? 0 : p.estimatedRevenue / max;
    const y = padY + chartH - ratio * chartH;
    return { x, y, p };
  });

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");
  const areaPath =
    coords.length > 0
      ? `${linePath} L ${coords[coords.length - 1]!.x.toFixed(1)} ${(padY + chartH).toFixed(1)} L ${coords[0]!.x.toFixed(1)} ${(padY + chartH).toFixed(1)} Z`
      : "";

  return (
    <section className="flex h-full flex-col rounded-2xl border border-border bg-surface p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-[13px] font-semibold leading-5 text-text-primary sm:text-sm">
            ارزش تخمینی رزروها
          </h2>
          <p className="text-[11px] leading-4 text-muted">هفت روز اخیر</p>
        </div>
        <span className="shrink-0 rounded-full border border-border bg-surface-subtle px-2.5 py-0.5 text-[10px] font-medium leading-4 text-muted sm:text-[11px]">
          شنبه تا جمعه
        </span>
      </div>

      {points.length === 0 || allZero ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 py-10 text-center">
          <p className="text-[13px] font-medium text-text-primary">
            هنوز ارزشی برای این هفته ثبت نشده
          </p>
          <p className="text-[11px] text-muted">
            پس از تکمیل رزروها، روند هفتگی اینجا نمایش داده می‌شود.
          </p>
        </div>
      ) : (
        <>
          <div className="relative min-h-[140px] w-full flex-1">
            <svg
              viewBox={`0 0 ${w} ${h}`}
              className="h-[140px] w-full overflow-visible"
              role="img"
              aria-label="نمودار ارزش تخمینی رزروهای هفتگی"
            >
              <defs>
                <linearGradient id="dashRevFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--primary)"
                    stopOpacity="0.28"
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--primary)"
                    stopOpacity="0.02"
                  />
                </linearGradient>
              </defs>
              {[0, 0.33, 0.66, 1].map((t) => (
                <line
                  key={t}
                  x1={padX}
                  x2={w - padX}
                  y1={padY + chartH * t}
                  y2={padY + chartH * t}
                  stroke="var(--border)"
                  strokeWidth="1"
                />
              ))}
              <motion.path
                d={areaPath}
                fill="url(#dashRevFill)"
                initial={{ opacity: reduceMotion ? 1 : 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: reduceMotion ? 0 : 0.45, ease: EASE }}
              />
              <motion.path
                d={linePath}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: reduceMotion ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: reduceMotion ? 0 : 0.7, ease: EASE }}
              />
              {coords.map(({ x, y, p }) => (
                <circle
                  key={p.date}
                  cx={x}
                  cy={y}
                  r={3.5}
                  fill="var(--surface)"
                  stroke="var(--primary)"
                  strokeWidth="2"
                >
                  <title>
                    {`${weekdayLabel(p.weekdayKey)}: ${formatMoneyOrDash(p.estimatedRevenue)} — ${formatCount(p.completedBookingCount)} رزرو تکمیل‌شده`}
                  </title>
                </circle>
              ))}
            </svg>
          </div>

          <div className="mt-1 flex gap-1">
            {points.map((p) => (
              <span
                key={p.date}
                className="flex-1 text-center text-[10px] leading-4 text-muted"
              >
                {weekdayLabel(p.weekdayKey).slice(0, 1)}
              </span>
            ))}
          </div>
        </>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border pt-2.5 text-[11px] leading-4">
        <span className="text-muted">
          جمع هفته:{" "}
          <span className="font-medium text-text-primary tabular-nums">
            {formatMoneyOrDash(sum)}
          </span>
        </span>
        {peak && peak.estimatedRevenue > 0 ? (
          <span className="text-muted">
            بیشترین:{" "}
            <span className="font-medium text-text-primary">
              {weekdayLabel(peak.weekdayKey)}
            </span>
          </span>
        ) : null}
      </div>
    </section>
  );
}

function TodayBookingRow({ item }: { item: DashboardTodayBookingItemDto }) {
  const name = customerDisplayName(item.customerName);
  const status = item.status as BookingStatus;
  return (
    <li className="flex items-center gap-2.5 px-3.5 py-2.5 sm:gap-3 sm:px-4">
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[12px] font-semibold text-primary"
      >
        {initialOf(name)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium leading-5 text-text-primary">
          {name}
        </p>
        <p className="truncate text-[11px] leading-4 text-muted">
          {item.serviceTitle}
          <span className="text-border-strong"> · </span>
          {item.employeeName}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-[12px] font-medium tabular-nums text-text-secondary">
          {formatBookingTime(item.startTime)}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium leading-4 ${bookingStatusBadgeClass(status)}`}
        >
          {dashboardBookingStatusLabel(item.status)}
        </span>
      </div>
      {item.price != null ? (
        <span className="hidden w-[5.5rem] shrink-0 text-end text-[11px] font-medium tabular-nums text-muted lg:inline">
          {formatBookingPrice(item.price)}
        </span>
      ) : null}
    </li>
  );
}

function TodayBookingsPanel({
  totalCount,
  items,
}: {
  totalCount: number;
  items: DashboardTodayBookingItemDto[];
}) {
  return (
    <section className="flex h-full flex-col rounded-2xl border border-border bg-surface shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between border-b border-border px-3.5 py-3 sm:px-4">
        <h2 className="text-[13px] font-semibold leading-5 text-text-primary sm:text-sm">
          نوبت‌های امروز
        </h2>
        <p className="text-[11px] leading-4 text-muted tabular-nums">
          {formatCount(totalCount)} نوبت
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 px-4 py-12 text-center">
          <p className="text-[13px] font-medium text-text-primary">
            نوبتی برای امروز ثبت نشده
          </p>
          <p className="text-[11px] text-muted">
            وقتی رزروی برای امروز باشد، اینجا نمایش داده می‌شود.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <TodayBookingRow key={item.id} item={item} />
          ))}
        </ul>
      )}

      <div className="mt-auto border-t border-border px-3.5 py-2.5 sm:px-4">
        <Link
          href="/dashboard/bookings"
          className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl text-[12.5px] font-semibold text-primary transition-colors duration-150 hover:bg-primary-soft/60 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none motion-reduce:active:scale-100"
        >
          مشاهده همه
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

function TopServicesPanel({
  periodStart,
  periodEnd,
  items,
}: BusinessDashboardDto["topServices"]) {
  const periodLabel =
    periodStart && periodEnd
      ? `${formatBookingDate(periodStart)} تا ${formatBookingDate(periodEnd)}`
      : "ماه جاری";

  return (
    <section className="rounded-2xl border border-border bg-surface p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-4">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-[13px] font-semibold leading-5 text-text-primary sm:text-sm">
            پرفروش‌ترین خدمات
          </h2>
          <p className="mt-0.5 text-[11px] leading-4 text-muted">{periodLabel}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-muted">
          هنوز خدمتی برای نمایش وجود ندارد
        </p>
      ) : (
        <ul className="flex flex-col gap-3.5">
          {items.map((service) => (
            <li key={service.serviceId}>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <p className="min-w-0 truncate text-[13px] font-medium text-text-primary">
                  {service.title}
                </p>
                <p className="shrink-0 text-[11px] tabular-nums text-muted">
                  {formatCount(service.percentage)}٪ ·{" "}
                  {formatCount(service.bookingCount)} رزرو
                </p>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-primary-soft"
                role="progressbar"
                aria-valuenow={Math.round(service.percentage)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={service.title}
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out motion-reduce:transition-none"
                  style={{
                    width: `${Math.min(100, Math.max(0, service.percentage))}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-3 sm:gap-4" aria-busy="true" aria-label="در حال بارگذاری داشبورد">
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="skeleton-shimmer h-[112px] rounded-2xl bg-surface"
          />
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <div className="skeleton-shimmer h-[280px] rounded-2xl bg-surface lg:col-span-3" />
        <div className="skeleton-shimmer h-[280px] rounded-2xl bg-surface lg:col-span-2" />
      </div>
      <div className="skeleton-shimmer h-[200px] rounded-2xl bg-surface" />
    </div>
  );
}

function DashboardLoaded({ data }: { data: BusinessDashboardDto }) {
  const reduceMotion = useReducedMotion();
  const { summary, capacity, weeklyRevenue, todayBookings, topServices } = data;
  const util = capacity?.utilizationPercent ?? null;
  const capacityHint =
    capacity?.occupiedMinutes != null && capacity?.availableMinutes != null
      ? `${formatCount(capacity.occupiedMinutes)} از ${formatCount(capacity.availableMinutes)} دقیقه`
      : undefined;

  const container = {
    hidden: {},
    visible: {
      transition: reduceMotion ? { duration: 0 } : { staggerChildren: 0.06 },
    },
  };
  const item = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.4, ease: EASE },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-3 sm:gap-4"
    >
      <motion.div
        variants={container}
        className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4"
      >
        {/* DOM order = RTL visual right→left matching screenshot */}
        <motion.div variants={item} className="h-full">
          <SummaryCard
            label="ظرفیت امروز"
            value={util == null ? "—" : `${formatCount(Math.round(util))}٪`}
            icon={Gauge}
            progress={util}
            hint={capacityHint}
          />
        </motion.div>
        <motion.div variants={item} className="h-full">
          <SummaryCard
            label="مشتریان"
            value={formatCount(summary.customerCount)}
            unit="نفر"
            icon={Users}
          />
        </motion.div>
        <motion.div variants={item} className="h-full">
          <SummaryCard
            label="نوبت‌های امروز"
            value={formatCount(summary.todayBookingsCount)}
            unit="نوبت"
            icon={CalendarDays}
          />
        </motion.div>
        <motion.div variants={item} className="h-full">
          <SummaryCard
            label="ارزش رزروهای تکمیل‌شده امروز"
            value={
              summary.todayEstimatedRevenue == null
                ? "—"
                : summary.todayEstimatedRevenue.toLocaleString("fa-IR")
            }
            unit={summary.todayEstimatedRevenue == null ? undefined : "تومان"}
            icon={Wallet}
            hint="برآورد ارزش رزرو، نه پرداخت قطعی"
          />
        </motion.div>
      </motion.div>

      <motion.div
        variants={container}
        className="grid gap-3 md:grid-cols-2 lg:grid-cols-5"
      >
        <motion.div variants={item} className="lg:col-span-3">
          <TodayBookingsPanel
            totalCount={todayBookings.totalCount}
            items={todayBookings.items}
          />
        </motion.div>
        <motion.div variants={item} className="lg:col-span-2">
          <WeeklyAreaChart points={weeklyRevenue} />
        </motion.div>
      </motion.div>

      <motion.div variants={item}>
        <TopServicesPanel {...topServices} />
      </motion.div>
    </motion.div>
  );
}

export function OwnerDashboard() {
  const data = useOwnerDashboardStore((s) => s.data);
  const status = useOwnerDashboardStore((s) => s.status);
  const error = useOwnerDashboardStore((s) => s.error);
  const fetchDashboard = useOwnerDashboardStore((s) => s.fetchDashboard);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  if (status === "idle" || status === "loading") {
    return (
      <>
        <div className="hidden md:block">
          <PageHeader hideBack title="داشبورد" description="در حال بارگذاری…" />
        </div>
        <div className="md:hidden">
          <PageHeader hideBack title="داشبورد" />
        </div>
        <DashboardSkeleton />
      </>
    );
  }

  if (status === "forbidden") {
    return null;
  }

  if (status === "notFound") {
    return (
      <>
        <div className="hidden md:block">
          <PageHeader
            hideBack
            title="داشبورد"
            description="برای مشاهدهٔ آمار، ابتدا سالن خود را ثبت کنید."
          />
        </div>
        <div className="md:hidden">
          <PageHeader hideBack title="داشبورد" />
          <p className="mb-4 text-[12.5px] leading-5 text-muted">
            برای مشاهدهٔ آمار، ابتدا سالن خود را ثبت کنید.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <p className="text-[14px] font-medium text-text-primary">
            {error ?? "هنوز سالنی برای حساب شما ثبت نشده است."}
          </p>
          <Link
            href="/dashboard/business"
            className={cn(buttonVariants({ size: "lg" }), "mt-4 inline-flex")}
          >
            ثبت سالن
          </Link>
        </div>
      </>
    );
  }

  if (status === "error" || !data) {
    return (
      <>
        <div className="hidden md:block">
          <PageHeader hideBack title="داشبورد" />
        </div>
        <div className="md:hidden">
          <PageHeader hideBack title="داشبورد" />
        </div>
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
      </>
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <PageHeader
          hideBack
          title="داشبورد"
          description="خلاصهٔ وضعیت امروز سالن شما."
        />
      </div>
      <div className="md:hidden">
        <PageHeader hideBack title="داشبورد" />
        <p className="mb-4 text-[12.5px] leading-5 text-muted">
          خلاصهٔ وضعیت امروز سالن شما.
        </p>
      </div>
      <DashboardLoaded data={data} />
    </>
  );
}

export function useOwnerDashboardStatus() {
  return useOwnerDashboardStore((s) => s.status);
}
