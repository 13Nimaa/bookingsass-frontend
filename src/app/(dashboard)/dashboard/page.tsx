"use client";

import Link from "next/link";
import {
  LogOut,
  Sparkles,
  Store,
  UserRound,
  UserRoundCog,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { useAuthStore } from "@/features/auth/store/auth-store";

const MENU_OPTIONS = [
  {
    href: "/dashboard/profile",
    icon: UserRound,
    title: "پروفایل",
    description: "اطلاعات حساب و تصویر پروفایل",
  },
  {
    href: "/dashboard/business",
    icon: Store,
    title: "کسب‌وکار",
    description: "مشخصات سالن و نشانی",
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
] as const;

export default function DashboardPage() {
  const logout = useAuthStore((s) => s.logout);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-6 pt-5 sm:px-8 sm:pb-8 md:px-10 md:pb-10 md:pt-9">
      <div className="hidden md:block">
        <PageHeader
          hideBack
          title="داشبورد"
          description="بخش مورد نظر را انتخاب کنید و مدیریت را ادامه دهید."
        />
      </div>

      <div className="md:hidden">
        <PageHeader hideBack title="داشبورد" />
        <div className="mb-5">
          <h2 className="text-[20px] font-bold leading-snug tracking-tight text-[#221F1C]">
            داشبورد
          </h2>
          <p className="mt-1.5 text-[12.5px] leading-5 font-normal text-[#6B7280]">
            بخش مورد نظر را انتخاب کنید و مدیریت را ادامه دهید.
          </p>
        </div>
      </div>

      <nav aria-label="منوی داشبورد" className="mt-6 w-full md:mt-8">
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {MENU_OPTIONS.map(({ href, icon: Icon, title, description }) => (
            <li key={href} className="min-w-0">
              <Link
                href={href}
                className="flex h-[112px] flex-col gap-2.5 rounded-2xl border border-[#E4E7EC] bg-surface p-3.5 transition-colors duration-150 hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:bg-primary-soft/50 motion-reduce:transition-none sm:h-[118px] sm:gap-3 sm:p-4 md:h-[128px]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="h-[21px] w-[21px]" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-semibold leading-snug text-[#221F1C] md:text-[14px]">
                    {title}
                  </span>
                  <span className="mt-0.5 line-clamp-2 text-[11.5px] leading-4 font-normal text-[#6B7280] md:text-[12px]">
                    {description}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => void logout()}
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[12px] border border-border bg-surface text-[13.5px] font-medium text-[#4B5563] transition-colors duration-150 hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none md:hidden"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          خروج از حساب
        </button>
      </nav>
    </main>
  );
}
