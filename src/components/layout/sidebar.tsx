"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, LogOut, Store, Sparkles, Users, UserRound } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/auth-store";

const NAV = [
  { href: "/dashboard/profile", label: "پروفایل", icon: UserRound },
  { href: "/dashboard/business", label: "کسب‌وکار", icon: Store },
  { href: "/dashboard/services", label: "خدمات", icon: Sparkles },
  { href: "/dashboard/customers", label: "مشتریان", icon: Users },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-border bg-surface md:sticky md:top-0 md:h-[100vh] md:w-64 md:border-b-0 md:border-e">
      {/* Brand header — on mobile this is the full sidebar; primary
          navigation lives in the global MobileTabBar on small screens. */}
      <Link href={'/'} className="flex items-center gap-2.5 px-4 py-3 md:px-5 md:py-5">
        <span  className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <CalendarCheck size={20} aria-hidden="true" />
        </span>
        <span className="text-[17px] font-extrabold tracking-tight text-[#1e1b4b]">BookFlow</span>
        {/* Compact sign-out on mobile — same action as the desktop footer */}
        <button
          type="button"
          onClick={() => void logout()}
          aria-label="خروج"
          title="خروج"
          className="ms-auto flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-surface-subtle hover:text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.97] md:hidden"
        >
          <LogOut size={18} aria-hidden="true" />
        </button>
      </Link>

      {/* Desktop / tablet vertical nav — hidden on mobile (MobileTabBar covers it) */}
      <nav className="hidden px-3 md:flex md:flex-col md:gap-1" aria-label="ناوبری داشبورد">
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
                  className="absolute top-1/2 right-0 h-5 w-1 -translate-y-1/2 rounded-full bg-primary"
                />
              )}
              <Icon size={18} className="shrink-0" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden md:mt-auto md:block md:border-t md:border-border-subtle md:px-5 md:py-4">
        <p className="truncate text-sm font-bold text-[#1e1b4b]">{user?.name}</p>
        <button
          onClick={() => void logout()}
          className="mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 transition-colors hover:text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <LogOut size={15} aria-hidden="true" />
          خروج
        </button>
      </div>
    </aside>
  );
}
