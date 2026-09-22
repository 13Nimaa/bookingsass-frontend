"use client";

import { useEffect, useState } from "react";
import { useBusinessStore } from "@/store/business-store";
import { BusinessForm } from "@/components/business/business-form";
import { Button } from "@/components/ui/button";
import { AuthError } from "@/components/ui/auth-error";
import { Pencil } from "lucide-react";

function PageTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="font-display text-3xl font-bold text-foreground">{children}</h1>;
}

export default function BusinessPage() {
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
            هنوز کسب‌وکاری نساخته‌اید. برای شروع، اطلاعات سالن خود را وارد کنید.
          </p>
          <BusinessForm mode="create" onDone={() => setEditing(false)} />
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
