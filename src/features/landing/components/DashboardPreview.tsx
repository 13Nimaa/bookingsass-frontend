import {
  Bell,
  CalendarDays,
  Gauge,
  LayoutDashboard,
  Search,
  Settings,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { StatCard } from "./StatCard";
import { AppointmentRow } from "./AppointmentRow";
import type { AppointmentStatus } from "./AppointmentRow";

const STATS = [
  {
    label: "درآمد امروز",
    value: "۲,۴۸۰,۰۰۰ تومان",
    icon: Wallet,
    hint: "+۱۲٪ نسبت به دیروز",
  },
  {
    label: "نوبت‌های امروز",
    value: "۲۴ نوبت",
    icon: CalendarDays,
    hint: "+۴ نوبت نسبت به دیروز",
  },
  {
    label: "مشتریان فعال",
    value: "۱۲۸ مشتری",
    icon: Users,
    hint: "+۹ مشتری جدید",
  },
  {
    label: "ظرفیت امروز",
    value: "۸۵٪ رزرو شده",
    icon: Gauge,
    hint: "+۷٪ نسبت به هفته قبل",
  },
];

const SIDEBAR_NAV = [
  { label: "داشبورد", icon: LayoutDashboard, active: true },
  { label: "نوبت‌ها", icon: CalendarDays },
  { label: "مشتریان", icon: Users },
  { label: "خدمات", icon: Sparkles },
  { label: "درآمد", icon: Wallet },
];

const CHART_DAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

const CHART_LINE_PATH =
  "M0,28 C8.57,28 12.86,28 21.43,28 C38.57,28 47.14,10 64.29,10 C81.43,10 90,34 107.14,34 C124.29,34 132.86,24 150,24 C167.14,24 175.71,46 192.86,46 C210,46 218.57,38 235.71,38 C252.86,38 261.43,54 278.57,54 C287.14,54 291.43,54 300,54";

const CHART_AREA_PATH = `${CHART_LINE_PATH} L300,100 L0,100 Z`;

const CHART_GRID_LINES = [25, 50, 75];

const APPOINTMENTS: {
  name: string;
  service: string;
  time: string;
  status: AppointmentStatus;
}[] = [
  { name: "علی رضایی", service: "اصلاح مو", time: "۱۰:۰۰", status: "confirmed" },
  {
    name: "حسین موسوی",
    service: "اصلاح ریش",
    time: "۱۱:۳۰",
    status: "in-progress",
  },
  {
    name: "امیر طاهری",
    service: "فرم دادن مو",
    time: "۱۳:۰۰",
    status: "waiting",
  },
  {
    name: "رضا کریمی",
    service: "کوتاهی کودک",
    time: "۱۴:۳۰",
    status: "confirmed",
  },
];

const TOP_SERVICES = [
  { name: "اصلاح مو", width: 82, label: "۸۲٪", bookings: "۴۲ رزرو" },
  { name: "اصلاح ریش", width: 64, label: "۶۴٪", bookings: "۳۱ رزرو" },
  { name: "رنگ و فرم مو", width: 47, label: "۴۷٪", bookings: "۱۹ رزرو" },
];

export function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(17,24,39,0.04),0_10px_28px_-10px_rgba(17,24,39,0.07),0_24px_48px_-24px_rgba(17,24,39,0.10),0_48px_96px_-48px_rgba(79,70,229,0.20)]">
      <div className="flex items-center gap-2 border-b border-border bg-surface-secondary px-3 py-2.5 sm:px-4">
        <span className="flex shrink-0 gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
        </span>
        <div className="flex flex-1 justify-center">
          <span
            dir="ltr"
            className="max-w-full truncate rounded-md border border-border bg-surface px-2.5 py-1 text-[10px] leading-4 text-muted sm:text-[11px]"
          >
            app.barbercrm.ir/dashboard
          </span>
        </div>
        <span
          className="hidden w-[46px] shrink-0 sm:block"
          aria-hidden="true"
        />
      </div>

      <div className="flex bg-background">
        <aside
          aria-hidden="true"
          className="hidden shrink-0 flex-col gap-1 border-e border-border bg-surface px-2 py-3 sm:flex lg:w-44 lg:px-3"
        >
          <div className="mb-2 hidden items-center gap-2 px-2 lg:flex">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-white">
              B
            </span>
            <span className="text-sm font-semibold text-text-primary">
              BarberCRM
            </span>
          </div>

          {SIDEBAR_NAV.map(({ label, icon: Icon, active }) => (
            <span
              key={label}
              className={`flex items-center justify-center gap-2 rounded-lg px-2 py-2 lg:justify-start lg:px-2.5 ${
                active
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span className="hidden text-[13px] lg:inline">{label}</span>
            </span>
          ))}

          <span className="mt-auto flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-muted lg:justify-start lg:px-2.5">
            <Settings className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span className="hidden text-[13px] lg:inline">تنظیمات</span>
          </span>
        </aside>

        <div className="min-w-0 flex-1 p-3 sm:p-4 lg:p-5">
          <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold leading-5 text-text-primary sm:text-sm">
                داشبورد
              </p>
              <p className="text-[11px] leading-4 text-muted">
                پنجشنبه، ۲۲ شهریور
              </p>
            </div>

            <div className="ms-auto flex items-center gap-2">
              <div
                aria-hidden="true"
                className="hidden h-8 items-center gap-2 rounded-lg border border-border bg-surface px-2.5 md:flex lg:h-9 lg:w-48"
              >
                <Search className="h-3.5 w-3.5 shrink-0 text-muted" />
                <span className="truncate text-[11px] text-muted">
                  جستجوی مشتری...
                </span>
              </div>

              <span
                aria-hidden="true"
                className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface lg:h-9 lg:w-9"
              >
                <Bell className="h-4 w-4 text-muted" strokeWidth={2} />
                <span className="absolute end-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-error" />
              </span>

              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-medium text-white ring-2 ring-primary-soft sm:h-9 sm:w-9"
              >
                م
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
            {STATS.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="mt-2 grid gap-2 sm:mt-3 sm:gap-3 lg:grid-cols-5">
            <div className="rounded-xl border border-border bg-surface p-3 sm:p-4 lg:col-span-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[13px] font-semibold leading-5 text-text-primary sm:text-sm">
                  درآمد هفتگی
                </p>
                <span className="rounded-full border border-border bg-surface-secondary px-2 py-0.5 text-[10px] leading-4 text-muted sm:text-[11px]">
                  ۷ روز اخیر
                </span>
              </div>

              <div className="relative" aria-hidden="true">
                <svg
                  viewBox="0 0 300 100"
                  preserveAspectRatio="none"
                  className="h-24 w-full sm:h-32"
                >
                  <defs>
                    <linearGradient
                      id="preview-chart-fill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--primary)"
                        stopOpacity="0.28"
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--primary)"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>

                  {CHART_GRID_LINES.map((y) => (
                    <line
                      key={y}
                      x1="0"
                      y1={y}
                      x2="300"
                      y2={y}
                      stroke="var(--border)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}

                  <path d={CHART_AREA_PATH} fill="url(#preview-chart-fill)" />
                  <path
                    className="chart-line"
                    d={CHART_LINE_PATH}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={1}
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                <span className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-white shadow-[0_0_0_3px_rgba(79,70,229,0.15)]" style={{ left: "21.43%", top: "10%" }} />
              </div>

              <div
                aria-hidden="true"
                className="mt-1.5 flex gap-1.5 sm:gap-2"
              >
                {CHART_DAYS.map((day) => (
                  <span
                    key={day}
                    className="flex-1 text-center text-[10px] leading-4 text-muted"
                  >
                    {day}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5 text-[11px] leading-4">
                <span className="text-muted">میانگین روزانه</span>
                <span className="font-medium text-text-primary">
                  ۳۵۴,۰۰۰ تومان
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface lg:col-span-2">
              <div className="flex items-center justify-between border-b border-border px-3 py-2.5 sm:px-4">
                <p className="text-[13px] font-semibold leading-5 text-text-primary sm:text-sm">
                  نوبت‌های امروز
                </p>
                <p className="text-[11px] leading-4 text-muted">۴ نوبت</p>
              </div>
              <div className="divide-y divide-border">
                {APPOINTMENTS.map((appointment) => (
                  <AppointmentRow key={appointment.name} {...appointment} />
                ))}
              </div>
              <div className="border-t border-border px-3 py-2.5 text-center text-[11px] font-medium leading-4 text-primary sm:px-4">
                مشاهده تقویم کامل
              </div>
            </div>
          </div>

          <div className="mt-2 rounded-xl border border-border bg-surface p-3 sm:mt-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[13px] font-semibold leading-5 text-text-primary sm:text-sm">
                خدمات پرفروش
              </p>
              <p className="text-[11px] leading-4 text-muted">این هفته</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
              {TOP_SERVICES.map((service) => (
                <div key={service.name}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-medium leading-5 text-text-primary">
                      {service.name}
                    </span>
                    <span className="shrink-0 text-[11px] leading-4 text-muted">
                      {service.label}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-primary-subtle">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-[#6366f1]"
                      style={{ width: `${service.width}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] leading-4 text-muted">
                    {service.bookings}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
