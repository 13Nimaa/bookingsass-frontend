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
import {
  OwnerDashboard,
  useOwnerDashboardStatus,
} from "@/features/business/components/owner-dashboard";
import { CustomerHomeDashboard } from "@/features/customer/components/customer-home-dashboard";

const MENU_OPTIONS: readonly {
  href: string;
  icon: LucideIcon;
  title: string;
}[] = [
  { href: "/dashboard/profile", icon: UserRound, title: "پروفایل" },
  { href: "/dashboard/business", icon: Store, title: "سالن" },
  { href: "/dashboard/bookings", icon: CalendarDays, title: "رزروها" },
  { href: "/dashboard/employees", icon: UserRoundCog, title: "کارمندان" },
  { href: "/dashboard/services", icon: Sparkles, title: "خدمات" },
  { href: "/dashboard/customers", icon: Users, title: "مشتریان" },
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

export default function DashboardPage() {
  const status = useOwnerDashboardStatus();
  const showOwnerAnalytics =
    status === "idle" ||
    status === "loading" ||
    status === "loaded" ||
    status === "notFound" ||
    status === "error";
  const showCustomerHome = status === "forbidden";

  return (
    <main className="mx-auto flex w-full container mx-auto flex-1 flex-col px-4 pb-6 pt-5 sm:px-8 sm:pb-8 md:px-10 md:pb-10 md:pt-9">
      {showOwnerAnalytics ? (
        <OwnerDashboard mobileShortcuts={<DashboardShortcutStrip />} />
      ) : null}
      {showCustomerHome ? <CustomerHomeDashboard /> : null}
    </main>
  );
}
