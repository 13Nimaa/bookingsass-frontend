"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useBusinessStore } from "@/features/business/store/business-store";
import { BusinessForm } from "@/features/business/components/business-form";
import { Button } from "@/components/ui/button";
import { AuthError } from "@/components/shared/auth-error";
import { ArrowLeft, Pencil, Store } from "lucide-react";

function PageTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="font-display text-3xl font-bold text-foreground">{children}</h1>;
}

export function BusinessDashboard() {
  const business = useBusinessStore((s) => s.business);
  const status = useBusinessStore((s) => s.status);
  const error = useBusinessStore((s) => s.error);
  const fetchMine = useBusinessStore((s) => s.fetchMine);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchMine();
  }, [fetchMine]);

  if (status === "loading" || status === "idle") {
    return (
      <main className="flex flex-1 flex-col gap-6 p-6 sm:p-10">
        <div className="h-9 w-40 animate-pulse rounded bg-surface-elevated motion-reduce:animate-none" />
        <div className="h-64 w-full max-w-2xl animate-pulse rounded-lg bg-surface-elevated motion-reduce:animate-none" />
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="flex flex-1 flex-col items-start gap-4 p-6 sm:p-10">
        <PageTitle>کسب‌وکار</PageTitle>
        {error && <AuthError message={error} />}
        <Button variant="secondary" onClick={() => fetchMine()}>
          تلاش دوباره
        </Button>
      </main>
    );
  }

  if (status === "notFound") {
    return (
      <main className="flex flex-1 flex-col p-6 sm:p-10">
        <div className="w-full max-w-2xl">
          <PageTitle>کسب‌وکار خود را بسازید</PageTitle>
          <p className="mt-2 mb-8 text-sm text-muted">
            هنوز کسب‌وکاری نساخته‌اید. با ثبت سالن، حساب شما به مدیر
            آرایشگاه ارتقا پیدا می‌کند.
          </p>

          {/* Customer → BusinessOwner CTA */}
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Store size={20} />
              </span>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  می‌خواهید آرایشگاه خود را مدیریت کنید؟
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted">
                  اطلاعات سالن خود را ثبت کنید تا حساب شما به «مدیر
                  آرایشگاه» تبدیل شود و به پنل مدیریت خدمات، مشتریان و
                  نوبت‌ها دسترسی پیدا کنید.
                </p>
              </div>
            </div>

            <Link
              href="/register/business"
              className="
                mt-5
                inline-flex
                h-11
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-primary
                px-6
                text-sm
                font-medium
                text-primary-foreground
                shadow-sm
                transition-all
                hover:bg-primary-hover
                active:bg-primary-pressed
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-primary
                sm:w-auto
              "
            >
              ثبت‌نام به عنوان مدیر آرایشگاه
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // status === "loaded"
  if (!business) return null;

  return (
    <main className="flex flex-1 flex-col p-6 sm:p-10">
      <div className="w-full max-w-2xl">
        {editing ? (
          <div className="transition-all duration-200">
            <PageTitle>ویرایش کسب‌وکار</PageTitle>
            <p className="mt-2 mb-8 text-sm text-muted">
              تغییرات را اعمال کنید و ذخیره کنید.
            </p>
            <BusinessForm
              mode="edit"
              initial={business}
              onDone={() => setEditing(false)}
              onCancel={() => setEditing(false)}
            />
          </div>
        ) : (
          <div className="transition-all duration-200">
            <div className="flex items-start justify-between gap-4">
              <PageTitle>{business.name}</PageTitle>
              <Button variant="secondary" onClick={() => setEditing(true)}>
                <Pencil size={15} />
                ویرایش
              </Button>
            </div>

            <dl className="mt-6 border-t border-border">
              <div className="grid gap-1 border-b border-border py-4 sm:grid-cols-[10rem_1fr] sm:gap-4">
                <dt className="text-sm text-muted">شهر</dt>
                <dd className="text-sm">{business.city}</dd>
              </div>
              <div className="grid gap-1 border-b border-border py-4 sm:grid-cols-[10rem_1fr] sm:gap-4">
                <dt className="text-sm text-muted">نشانی</dt>
                <dd className="text-sm">{business.address}</dd>
              </div>
              <div className="grid gap-1 border-b border-border py-4 sm:grid-cols-[10rem_1fr] sm:gap-4">
                <dt className="text-sm text-muted">توضیحات</dt>
                <dd className="text-sm leading-7 whitespace-pre-line">
                  {business.description || <span className="text-muted">ثبت نشده</span>}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </main>
  );
}
