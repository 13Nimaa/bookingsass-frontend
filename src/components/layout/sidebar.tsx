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
    <aside className="flex w-full shrink-0 flex-col border-b border-border bg-surface md:sticky md:top-0 md:h-[100vh] md:w-64 md:border-b-0 md:border-e">
      <div className="flex items-center gap-2.5 px-4 py-3 md:px-5 md:py-5">
        <Link
          href="/"
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <CalendarCheck size={20} aria-hidden="true" />
          </span>
          <span className="truncate text-[17px] font-extrabold tracking-tight text-[#1e1b4b]">
            BookFlow
          </span>
        </Link>
        <button
          type="button"
          onClick={() => void logout()}
          aria-label="خروج"
          title="خروج"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-error-soft hover:text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.97] md:hidden"
        >
          <LogOut size={18} aria-hidden="true" />
        </button>
      </div>

      <nav
        className="hidden px-3 md:flex md:flex-col md:gap-1"
        aria-label="ناوبری داشبورد"
      >
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`relative flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] ${
                active
                  ? "bg-primary-soft font-bold text-primary"
                  : "font-semibold text-slate-600 hover:bg-primary-soft/60 hover:text-[#1e1b4b]"
              }`}
            >
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 start-0 h-5 w-1 -translate-y-1/2 rounded-full bg-primary"
                />
              )}
              <Icon size={18} className="shrink-0" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden md:mt-auto md:block md:border-t md:border-border-subtle md:px-4 md:py-4">
        <div className="flex items-center gap-3 rounded-2xl bg-surface-subtle px-3 py-3">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[13px] font-extrabold text-primary ring-1 ring-primary-subtle ring-inset"
          >
            {userInitials(user?.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[#1e1b4b]">
              {user?.name ?? "کاربر"}
            </p>
            {user?.phoneNumber && (
              <p dir="ltr" className="mt-0.5 truncate text-start text-[12px] font-semibold text-slate-500 tnum">
                {user.phoneNumber}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface text-[13px] font-bold text-slate-600 transition-colors hover:border-error-border hover:bg-error-soft hover:text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <LogOut size={16} aria-hidden="true" />
          خروج از حساب
        </button>
      </div>
    </aside>
  );
}
