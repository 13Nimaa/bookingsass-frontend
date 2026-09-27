"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "cn";
import { useAuthStore } from "@/features/auth/store/auth-store";

export interface NavbarLink {
  label: string;
  href: string;
}

const DEFAULT_LINKS: readonly NavbarLink[] = [
  { label: "امکانات", href: "/#capabilities" },
  { label: "پنل مدیریت", href: "/#product" },
  { label: "قیمت‌گذاری", href: "/#pricing" },
  { label: "سوالات متداول", href: "/#faq" },
];

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F46E5]";

interface NavbarProps {
  className?: string;
  links?: readonly NavbarLink[];
  loginHref?: string;
  signupHref?: string;
}

export function Navbar({
  className,
  links = DEFAULT_LINKS,
  loginHref = "/login",
  signupHref = "/register",
}: NavbarProps) {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const reduceMotion = useReducedMotion();
  const headerRef = React.useRef<HTMLElement | null>(null);
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const authedUser = status === "authenticated" ? user : null;

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = React.useCallback(() => setOpen(false), []);

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
        "sticky top-0 z-50 w-full border-b border-[#E5E7EB] bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur-md transition-shadow duration-200",
        scrolled &&
          "shadow-[0_1px_2px_rgba(17,24,39,0.04),0_10px_24px_-12px_rgba(17,24,39,0.10)]",
        className
      )}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid h-[60px] grid-cols-[auto_1fr_auto] items-center gap-4 sm:h-[64px] md:h-[72px] md:gap-5 lg:gap-8">
          {/* Logo */}
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center gap-2.5 rounded-[10px] md:gap-3"
          >
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#EEF2FF] text-[15px] font-semibold text-[#4F46E5] md:h-10 md:w-10"
            >
              B
            </span>

            <span className="flex flex-col">
              <span className="text-[15px] font-semibold leading-tight tracking-tight text-[#111827]">
                BarberCRM
              </span>

              <span className="hidden text-[11px] font-normal leading-tight text-[#6B7280] lg:block">
                مدیریت هوشمند آرایشگاه
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="ناوبری اصلی"
            className="hidden min-w-0 md:block"
          >
            <ul className="flex items-center justify-center gap-0.5 lg:gap-1">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "inline-flex min-h-[44px] items-center rounded-[10px] px-2.5 text-base font-medium text-[#151618] font-medium transition-colors duration-150 hover:bg-[#F8F9FB] hover:text-[#111827] lg:px-3",
                      FOCUS_RING
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Actions */}
          <div className="flex items-center justify-self-end gap-1.5 lg:gap-2">
            {authedUser ? (
              /* Logged in — show profile chip instead of auth CTAs */
              <Link
                href="/dashboard"
                onClick={closeMenu}
                aria-label={`پروفایل ${authedUser.name}`}
                className={cn(
                  "hidden min-h-[44px] items-center gap-2 rounded-[10px] px-2 transition-colors duration-150 hover:bg-[#F8F9FB] md:inline-flex lg:px-2.5",
                  FOCUS_RING
                )}
              >
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[13px] font-semibold text-[#4F46E5]"
                >
                  {authedUser.name.trim().charAt(0) || "ک"}
                </span>
                <span className="max-w-[120px] truncate text-[14px] font-medium text-[#374151] lg:max-w-[160px]">
                  {authedUser.name}
                </span>
              </Link>
            ) : (
              <>
                {/* Login */}
                <Link
                  href={loginHref}
                  className={cn(
                    "hidden min-h-[44px] items-center rounded-[10px] px-3 text-[14px] font-medium text-[#374151] transition-colors duration-150 hover:bg-[#F8F9FB] hover:text-[#111827] md:inline-flex",
                    FOCUS_RING
                  )}
                >
                  ورود
                </Link>

                {/* Signup */}
                <Link
                  href={signupHref}
                  className={cn(
                    "hidden h-10 items-center rounded-[10px] bg-[#4F46E5] px-3.5 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(17,24,39,0.05)] transition-colors duration-150 hover:bg-[#4338CA] active:bg-[#3730A3] md:inline-flex lg:px-4",
                    FOCUS_RING
                  )}
                >
                  شروع رایگان
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-[10px] text-[#374151] transition-colors duration-150 hover:bg-[#F8F9FB] hover:text-[#111827] md:hidden",
                FOCUS_RING
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
                    open
                      ? "rotate-90 opacity-0"
                      : "rotate-0 opacity-100"
                  )}
                />

                <X
                  strokeWidth={1.75}
                  className={cn(
                    "absolute inset-0 h-5 w-5 transition-all duration-200 motion-reduce:transition-none",
                    open
                      ? "rotate-0 opacity-100"
                      : "-rotate-90 opacity-0"
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
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
            className="absolute inset-x-0 top-full border-b border-[#E5E7EB] bg-white shadow-[0_16px_32px_-16px_rgba(17,24,39,0.12)] md:hidden"
          >
            <nav
              aria-label="منوی ناوبری"
              className=" w-full px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6"
            >
              <ul className="flex flex-col">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={closeMenu}
                      className={cn(
                        "flex min-h-[48px] items-center rounded-[10px] px-3 text-[15px] font-medium text-[#374151] transition-colors duration-150 hover:bg-[#F8F9FB] hover:text-[#4F46E5]",
                        FOCUS_RING
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-2 flex flex-col gap-2 border-t border-[#E5E7EB] pt-4">
                {authedUser ? (
                  /* Logged in — profile link instead of auth CTAs */
                  <Link
                    href="/dashboard"
                    onClick={closeMenu}
                    className={cn(
                      "flex min-h-[48px] items-center justify-center gap-2.5 rounded-[10px] px-3 text-[15px] font-medium text-[#374151] transition-colors duration-150 hover:bg-[#F8F9FB] hover:text-[#4F46E5]",
                      FOCUS_RING
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[13px] font-semibold text-[#4F46E5]"
                    >
                      {authedUser.name.trim().charAt(0) || "ک"}
                    </span>
                    <span className="truncate">{authedUser.name}</span>
                  </Link>
                ) : (
                  <>
                    {/* Mobile Login */}
                    <Link
                      href={loginHref}
                      onClick={closeMenu}
                      className={cn(
                        "flex min-h-[48px] items-center justify-center rounded-[10px] text-[15px] font-medium text-[#374151] transition-colors duration-150 hover:bg-[#F8F9FB] hover:text-[#111827]",
                        FOCUS_RING
                      )}
                    >
                      ورود
                    </Link>

                    {/* Mobile Signup */}
                    <Link
                      href={signupHref}
                      onClick={closeMenu}
                      className={cn(
                        "flex min-h-[48px] items-center justify-center rounded-[10px] bg-[#4F46E5] text-[15px] font-medium text-white shadow-[0_1px_2px_rgba(17,24,39,0.05)] transition-colors duration-150 hover:bg-[#4338CA] active:bg-[#3730A3]",
                        FOCUS_RING
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