"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "cn";
import { useAuthStore } from "@/features/auth/store/auth-store";

export interface NavbarLink {
  label: string;
  href: string;
}

const DEFAULT_LINKS: readonly NavbarLink[] = [
  { label: "سالن‌ها", href: "/businesses" },
  { label: "امکانات", href: "/#capabilities" },
  { label: "پنل مدیریت", href: "/#product" },
  { label: "قیمت‌گذاری", href: "/#pricing" },
  { label: "سوالات متداول", href: "/#faq" },
];

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

function linkIsActive(href: string, pathname: string, hash: string): boolean {
  if (href.startsWith("/#")) {
    if (pathname !== "/") return false;
    return hash === href.slice(1); // "#capabilities"
  }
  if (href.includes("#")) {
    const [path, fragment] = href.split("#");
    return pathname === (path || "/") && hash === `#${fragment}`;
  }
  if (href === "/businesses") return pathname.startsWith("/businesses");
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface NavbarProps {
  className?: string;
  links?: readonly NavbarLink[];
  loginHref?: string;
  signupHref?: string;
}

function subscribeToUrl(onStoreChange: () => void) {
  window.addEventListener("hashchange", onStoreChange);
  window.addEventListener("popstate", onStoreChange);
  return () => {
    window.removeEventListener("hashchange", onStoreChange);
    window.removeEventListener("popstate", onStoreChange);
  };
}

function getClientHash() {
  return window.location.hash;
}

export function Navbar({
  className,
  links = DEFAULT_LINKS,
  loginHref = "/login",
  signupHref = "/register",
}: NavbarProps) {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  // Optimistic active target — Next.js soft nav often skips hashchange.
  const [pendingHref, setPendingHref] = React.useState<string | null>(null);
  const [pendingFrom, setPendingFrom] = React.useState<string | null>(null);
  const hash = React.useSyncExternalStore(
    subscribeToUrl,
    getClientHash,
    () => "",
  );
  const locationKey = `${pathname}\0${hash}`;
  const reduceMotion = useReducedMotion();
  const headerRef = React.useRef<HTMLElement | null>(null);
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const authedUser = status === "authenticated" ? user : null;

  // URL moved after a click (or back/forward) — drop optimistic highlight.
  if (
    pendingHref != null &&
    pendingFrom != null &&
    pendingFrom !== locationKey
  ) {
    setPendingHref(null);
    setPendingFrom(null);
  }

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = React.useCallback(() => setOpen(false), []);

  const onNavLinkClick = React.useCallback(
    (href: string) => {
      setPendingHref(href);
      setPendingFrom(locationKey);
      closeMenu();
    },
    [closeMenu, locationKey],
  );

  const isLinkActive = React.useCallback(
    (href: string) =>
      pendingHref != null
        ? pendingHref === href
        : linkIsActive(href, pathname, hash),
    [pendingHref, pathname, hash],
  );

  React.useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const media = window.matchMedia("(min-width: 768px)");

    const onBreakpoint = () => {
      if (media.matches) setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    media.addEventListener("change", onBreakpoint);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      media.removeEventListener("change", onBreakpoint);
    };
  }, [open]);

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "sticky top-0 z-50 w-full border-b border-border bg-surface/90 pt-[env(safe-area-inset-top)] backdrop-blur-md transition-shadow duration-200",
          scrolled &&
            "shadow-[0_1px_2px_rgba(17,24,39,0.04),0_10px_24px_-12px_rgba(17,24,39,0.10)]",
          className,
        )}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid h-[64px] grid-cols-[auto_1fr_auto] items-center gap-4 sm:h-[68px] md:h-[76px] md:gap-6 lg:gap-10">
            <Link
              href="/"
              onClick={closeMenu}
              className="flex items-center gap-2.5 rounded-xl md:gap-3"
            >
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-primary-soft text-[15px] font-bold text-primary md:h-10 md:w-10"
              >
                B
              </span>

              <span className="flex flex-col justify-center gap-0.5">
                <span className="text-[16px] font-bold leading-none tracking-tight text-text-primary md:text-[17px]">
                  BarberCRM
                </span>

                <span className="hidden text-[11px] font-normal leading-none text-muted lg:block">
                  مدیریت هوشمند آرایشگاه
                </span>
              </span>
            </Link>

            <nav aria-label="ناوبری اصلی" className="hidden min-w-0 md:block">
              <ul className="flex items-center justify-center gap-1 lg:gap-1.5">
                {links.map((link) => {
                  const active = isLinkActive(link.href);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => onNavLinkClick(link.href)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "relative inline-flex h-11 items-center px-3 text-[14px] font-medium transition-colors duration-150 lg:px-3.5",
                          FOCUS_RING,
                          active
                            ? "rounded-md bg-primary-soft/70 font-semibold text-primary"
                            : "rounded-md text-text-primary hover:bg-surface-secondary/80 hover:text-text-primary",
                        )}
                      >
                        {link.label}
                        {active ? (
                          <span
                            aria-hidden="true"
                            className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary"
                          />
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-center justify-self-end gap-1.5 lg:gap-2">
              {authedUser ? (
                <Link
                  href="/dashboard"
                  onClick={closeMenu}
                  aria-label={`پروفایل ${authedUser.name}`}
                  className={cn(
                    "hidden h-11 items-center gap-2.5 rounded-xl px-2 transition-colors duration-150 hover:bg-surface-secondary md:inline-flex lg:px-2.5",
                    FOCUS_RING,
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[12px] font-semibold text-primary"
                  >
                    {authedUser.name.trim().charAt(0) || "ک"}
                  </span>
                  <span className="max-w-[120px] truncate text-[13px] font-medium text-muted lg:max-w-[160px]">
                    {authedUser.name}
                  </span>
                </Link>
              ) : (
                <>
                  <Link
                    href={loginHref}
                    className={cn(
                      "hidden h-11 items-center rounded-xl px-3 text-[14px] font-medium text-muted transition-colors duration-150 hover:bg-surface-secondary hover:text-text-primary md:inline-flex",
                      FOCUS_RING,
                    )}
                  >
                    ورود
                  </Link>

                  <Link
                    href={signupHref}
                    className={cn(
                      "hidden h-10 items-center rounded-xl bg-primary px-3.5 text-[14px] font-medium text-white transition-colors duration-150 hover:bg-primary-hover active:bg-primary-pressed md:inline-flex lg:px-4",
                      FOCUS_RING,
                    )}
                  >
                    شروع رایگان
                  </Link>
                </>
              )}

              <button
                type="button"
                className={cn(
                  "inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted transition-colors duration-150 hover:bg-surface-secondary hover:text-text-primary md:hidden",
                  FOCUS_RING,
                )}
                aria-label={open ? "بستن منو" : "باز کردن منو"}
                aria-expanded={open}
                aria-controls="navbar-mobile-menu"
                onClick={() => setOpen((value) => !value)}
              >
                <span className="relative block h-5 w-5" aria-hidden="true">
                  <Menu
                    strokeWidth={1.75}
                    className={cn(
                      "absolute inset-0 h-5 w-5 transition-all duration-200 motion-reduce:transition-none",
                      open ? "rotate-90 opacity-0" : "rotate-0 opacity-100",
                    )}
                  />

                  <X
                    strokeWidth={1.75}
                    className={cn(
                      "absolute inset-0 h-5 w-5 transition-all duration-200 motion-reduce:transition-none",
                      open ? "rotate-0 opacity-100" : "-rotate-90 opacity-0",
                    )}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              id="navbar-mobile-menu"
              initial={{
                opacity: 0,
                y: reduceMotion ? 0 : -8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: reduceMotion ? 0 : -8,
              }}
              transition={{
                duration: reduceMotion ? 0 : 0.2,
                ease: "easeOut",
              }}
              className="absolute inset-x-0 top-full border-b border-border bg-surface shadow-[0_16px_32px_-16px_rgba(17,24,39,0.12)] md:hidden"
            >
              <nav
                aria-label="منوی ناوبری"
                className="w-full px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6"
              >
                <ul className="flex flex-col">
                  {links.map((link) => {
                    const active = isLinkActive(link.href);
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => onNavLinkClick(link.href)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "relative flex min-h-[48px] items-center rounded-xl px-3 text-[15px] font-medium transition-colors duration-150",
                            FOCUS_RING,
                            active
                              ? "bg-primary-soft/70 font-semibold text-primary"
                              : "text-muted hover:bg-surface-secondary hover:text-text-primary",
                          )}
                        >
                          {link.label}
                          {active ? (
                            <span
                              aria-hidden="true"
                              className="absolute inset-y-3 start-0 w-0.5 rounded-full bg-primary"
                            />
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
                  {authedUser ? (
                    <Link
                      href="/dashboard"
                      onClick={closeMenu}
                      className={cn(
                        "flex min-h-[48px] items-center justify-center gap-2.5 rounded-[10px] px-3 text-[15px] font-medium text-muted transition-colors duration-150 hover:bg-surface-secondary hover:text-primary",
                        FOCUS_RING,
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[13px] font-semibold text-primary"
                      >
                        {authedUser.name.trim().charAt(0) || "ک"}
                      </span>
                      <span className="truncate">{authedUser.name}</span>
                    </Link>
                  ) : (
                    <>
                      <Link
                        href={loginHref}
                        onClick={closeMenu}
                        className={cn(
                          "flex min-h-[48px] items-center justify-center rounded-[10px] text-[15px] font-medium text-muted transition-colors duration-150 hover:bg-surface-secondary hover:text-text-primary",
                          FOCUS_RING,
                        )}
                      >
                        ورود
                      </Link>

                      <Link
                        href={signupHref}
                        onClick={closeMenu}
                        className={cn(
                          "flex min-h-[48px] items-center justify-center rounded-[10px] bg-primary text-[15px] font-medium text-white shadow-[0_1px_2px_rgba(17,24,39,0.05)] transition-colors duration-150 hover:bg-primary-hover active:bg-primary-pressed",
                          FOCUS_RING,
                        )}
                      >
                        شروع رایگان
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
