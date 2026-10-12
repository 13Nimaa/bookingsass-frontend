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
    <aside className="flex w-full shrink-0 flex-col border-e border-border bg-surface lg:h-[100vh] lg:w-60">
      <div className="flex items-center gap-2 px-5 py-5 text-lg font-semibold">
        <CalendarCheck size={22} className="text-primary" />
        BookFlow
      </div>

      <nav className="flex gap-1 px-3 lg:flex-col" aria-label="ناوبری داشبورد">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                active
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted hover:bg-surface-elevated hover:text-foreground"
              }`}
            >
              <Icon size={17} className="shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border px-5 py-4">
        <p className="truncate text-sm font-medium">{user?.name}</p>
        <button
          onClick={() => void logout()}
          className="mt-1 flex items-center gap-1.5 text-sm text-muted hover:text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <LogOut size={15} />
          خروج
        </button>
      </div>
    </aside>
  );
}
