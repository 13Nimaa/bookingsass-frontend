"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  LogOut,
  Sparkles,
  Store,
  UserRound,
  UserRoundCog,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/store/auth-store";

const NAV = [
  { href: "/dashboard/profile", label: "پروفایل", icon: UserRound },
  { href: "/dashboard/business", label: "کسب‌وکار", icon: Store },
  { href: "/dashboard/employees", label: "کارمندان", icon: UserRoundCog },
  { href: "/dashboard/services", label: "خدمات", icon: Sparkles },
  { href: "/dashboard/customers", label: "مشتریان", icon: Users },
] as const;

function userInitials(name: string | undefined): string {
  if (!name?.trim()) return "؟";
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((p) => p[0]!).join("");
}

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="hidden shrink-0 flex-col border-border bg-surface md:sticky md:top-0 md:flex md:h-[100vh] md:w-[232px] md:border-e">
      <div className="flex h-16 shrink-0 items-center px-4 lg:h-[68px] lg:px-5">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-primary-soft text-primary">
            <CalendarCheck size={18} aria-hidden="true" />
          </span>
          <span className="truncate text-[16px] font-bold tracking-tight text-text-primary">
            BookFlow
          </span>
        </Link>
      </div>

      <nav
        className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3"
        aria-label="ناوبری داشبورد"
      >
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex h-11 items-center gap-2.5 rounded-[11px] px-3.5 text-[13.5px] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none ${
                active
                  ? "bg-primary-soft font-semibold text-primary"
                  : "font-medium text-[#4B5563] hover:bg-surface-secondary hover:text-text-primary"
              }`}
            >
              <Icon
                size={18}
                className={`shrink-0 ${active ? "text-primary" : "text-[#64748B]"}`}
                aria-hidden="true"
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto shrink-0 px-3 pb-4 pt-3">
        <div className="flex items-center gap-3 rounded-[14px] bg-surface-secondary/80 px-3 py-2.5">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[12px] font-bold text-primary"
          >
            {userInitials(user?.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-text-primary">
              {user?.name ?? "کاربر"}
            </p>
            {user?.phoneNumber && (
              <p
                dir="ltr"
                className="mt-0.5 truncate text-start text-[11.5px] font-medium text-[#6B7280] tnum"
              >
                {user.phoneNumber}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="mt-2.5 flex h-10 w-full items-center justify-center gap-2 rounded-[11px] border border-border bg-surface text-[13px] font-medium text-[#4B5563] transition-colors duration-150 hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none"
        >
          <LogOut size={16} aria-hidden="true" />
          خروج از حساب
        </button>
      </div>
    </aside>
  );
}
