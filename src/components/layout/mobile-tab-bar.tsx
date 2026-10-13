"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Store, LayoutDashboard, UserRound, LogIn } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { cn } from "cn";

interface TabItem {
  href: string;
  label: string;
  icon: typeof House;
  isActive: (pathname: string) => boolean;
}

const GUEST_TABS: readonly TabItem[] = [
  { href: "/", label: "خانه", icon: House, isActive: (p) => p === "/" },
  { href: "/businesses", label: "کسب‌وکارها", icon: Store, isActive: (p) => p.startsWith("/businesses") },
  { href: "/login", label: "ورود", icon: LogIn, isActive: (p) => p.startsWith("/login") || p.startsWith("/register") },
] as const;

const AUTHED_TABS: readonly TabItem[] = [
  { href: "/", label: "خانه", icon: House, isActive: (p) => p === "/" },
  { href: "/businesses", label: "کسب‌وکارها", icon: Store, isActive: (p) => p.startsWith("/businesses") },
  {
    href: "/dashboard",
    label: "داشبورد",
    icon: LayoutDashboard,
    isActive: (p) => p === "/dashboard" || p.startsWith("/dashboard/business"),
  },
  {
    href: "/dashboard/profile",
    label: "پروفایل",
    icon: UserRound,
    isActive: (p) => p.startsWith("/dashboard/profile"),
  },
] as const;

/**
 * Global mobile navigation — rendered once in the root layout so it is
 * reachable from every page (landing, businesses, auth, dashboard).
 * Mobile-only (`md:hidden`); desktop keeps Navbar / Sidebar.
 * Links only to routes that exist. Auth-aware via the existing auth store.
 */
export function MobileTabBar() {
  const pathname = usePathname();
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  const tabs = status === "authenticated" && user ? AUTHED_TABS : GUEST_TABS;

  return (
    <>
      {/* In-flow spacer so the fixed bar never covers page content */}
      <div aria-hidden="true" className="h-[74px] shrink-0 md:hidden" />

      <nav
        aria-label="ناوبری موبایل"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <ul className="flex items-stretch px-2 pt-2">
          {tabs.map(({ href, label, icon: Icon, isActive }) => {
            const active = isActive(pathname ?? "/");
            return (
              <li key={href} className="min-w-0 flex-1">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-2xl text-[11px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary active:scale-[0.97]",
                    active ? "font-bold text-primary" : "font-semibold text-slate-500 hover:text-[#1e1b4b]"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex h-7 items-center rounded-full px-4 transition-colors",
                      active && "bg-primary-soft"
                    )}
                  >
                    <Icon size={20} strokeWidth={active ? 2.25 : 2} />
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
