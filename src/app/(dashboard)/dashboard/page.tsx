"use client";

import Link from "next/link";
import {
  CalendarDays,
  Sparkles,
  Store,
  UserRound,
  UserRoundCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import {
  OwnerDashboard,
  useOwnerDashboardStatus,
} from "@/features/business/components/owner-dashboard";

const MENU_OPTIONS: readonly {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    href: "/dashboard/profile",
    icon: UserRound,
    title: "پروفایل",
    description: "اطلاعات حساب و تصویر پروفایل",
  },
  {
    href: "/dashboard/business",
    icon: Store,
    title: "سالن",
    description: "مشخصات سالن و نشانی",
  },
  {
    href: "/dashboard/bookings",
    icon: CalendarDays,
    title: "رزروها",
    description: "مشاهده و مدیریت رزروهای سالن",
  },
  {
    href: "/dashboard/employees",
    icon: UserRoundCog,
    title: "کارمندان",
    description: "مدیریت کارکنان و برنامهٔ کاری",
  },
  {
    href: "/dashboard/services",
    icon: Sparkles,
    title: "خدمات",
    description: "فهرست خدمات، قیمت و مدت زمان",
  },
  {
    href: "/dashboard/customers",
    icon: Users,
    title: "مشتریان",
    description: "مدیریت اطلاعات مشتریان سالن",
  },
];

function DashboardShortcutStrip() {
  return (
    <nav aria-label="میانبرهای داشبورد" className="mb-4 md:hidden">
      <ul className="grid grid-cols-3 gap-2">
        {MENU_OPTIONS.map(({ href, icon: Icon, title }) => (
          <li key={href} className="min-w-0">
            <Link
              href={href}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-surface px-1 py-2.5 text-center transition-colors duration-150 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <span className="truncate text-[11px] font-bold leading-tight text-text-primary">
                {title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function DashboardHub() {
  return (
    <>
      <div className="hidden md:block">
        <PageHeader
          hideBack
          title="داشبورد"
          description="بخش مورد نظر را انتخاب کنید و مدیریت را ادامه دهید."
        />
      </div>
      <div className="md:hidden">
        <PageHeader hideBack title="داشبورد" />
        <p className="mb-4 text-[12.5px] leading-5 font-normal text-muted">
          بخش مورد نظر را انتخاب کنید و مدیریت را ادامه دهید.
        </p>
      </div>

      <nav aria-label="منوی داشبورد" className="mt-4 w-full md:mt-8">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
          {MENU_OPTIONS.map(({ href, icon: Icon, title, description }) => (
            <li key={href} className="min-w-0">
              <Link
                href={href}
                className="flex h-[112px] flex-col gap-2.5 rounded-2xl border border-[#E4E7EC] bg-surface p-3.5 transition-colors duration-150 hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:bg-primary-soft/50 active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100 sm:h-[118px] sm:gap-3 sm:p-4 md:h-[128px]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="h-[21px] w-[21px]" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-semibold leading-snug text-text-primary md:text-[14px]">
                    {title}
                  </span>
                  <span className="mt-0.5 line-clamp-2 text-[11.5px] leading-4 font-normal text-muted md:text-[12px]">
                    {description}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

export default function DashboardPage() {
  const status = useOwnerDashboardStatus();
  const showOwnerAnalytics =
    status === "idle" ||
    status === "loading" ||
    status === "loaded" ||
    status === "notFound" ||
    status === "error";
  const showHubOnly = status === "forbidden";

  return (
    <main className="mx-auto flex w-full container mx-auto flex-1 flex-col px-4 pb-6 pt-5 sm:px-8 sm:pb-8 md:px-10 md:pb-10 md:pt-9">
      {showOwnerAnalytics ? (
        <OwnerDashboard mobileShortcuts={<DashboardShortcutStrip />} />
      ) : null}
      {showHubOnly ? <DashboardHub /> : null}
    </main>
  );
}
