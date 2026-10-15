import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, MapPin } from "lucide-react";
import { listBusinesses } from "@/lib/api/endpoints/business.endpoints";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";

export const metadata: Metadata = {
  title: "کسب‌وکارها - BarberCRM",
};

// Fresh on every request — new businesses appear immediately.
export const dynamic = "force-dynamic";

export default async function BusinessesPage() {
  const { data: businesses, failed } = await listBusinesses();

  return (
    <main className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <CalendarCheck size={22} className="text-primary" />
            BookFlow
          </div>
          <Link href="/login" className="text-sm text-primary hover:underline">
            ورود
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <h1 className="font-display text-3xl font-bold">کسب‌وکارها</h1>
        <p className="mt-2 text-sm text-muted">
          سالن‌ها و کسب‌وکارهای ثبت‌شده را ببینید و نوبت رزرو کنید.
        </p>

        {failed ? (
          <p className="mt-10 text-sm text-error">
            دریافت فهرست کسب‌وکارها ممکن نشد. لطفاً بعداً دوباره تلاش کنید.
          </p>
        ) : businesses.length === 0 ? (
          <p className="mt-10 text-sm text-muted">
            هنوز کسب‌وکاری ثبت نشده است.
          </p>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((b) => (
              <li
                key={b.id}
                className="rounded-lg border border-border bg-surface p-5 transition-colors hover:border-primary/40"
              >
                <h2 className="font-display text-lg font-semibold">{b.name}</h2>
                <p className="mt-1 text-xs text-muted">{b.city}</p>
                <p className="mt-3 flex items-start gap-1.5 text-sm text-muted">
                  <MapPin size={15} className="mt-0.5 shrink-0" />
                  <span>{b.address}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
      <MobileTabBar />
    </main>
  );
}
