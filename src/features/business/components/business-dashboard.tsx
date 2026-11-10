"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useBusinessStore } from "@/features/business/store/business-store";
import { BusinessForm } from "@/features/business/components/business-form";
import { BusinessGalleryField } from "@/features/business/components/business-gallery-field";
import { Button } from "@/components/ui/button";
import { AuthError } from "@/components/shared/auth-error";
import { PageHeader } from "@/components/shared/page-header";
import { registerBusinessRequest } from "@/lib/api/endpoints/business.endpoints";
import { useAuthStore } from "@/features/auth/store/auth-store";
import type { AuthResponse } from "@/features/auth/types";
import type { BusinessInput } from "@/features/business/types";
import { MapPin, Building2, Pencil, Store, FileText } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const, delay: i * 0.07 },
  }),
};

function LoadingState() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-10 sm:py-10" aria-busy="true">
      <PageHeader title="سالن" description="در حال بارگذاری…" />
      <div className="skeleton-shimmer h-72 w-full max-w-2xl rounded-[1.75rem] bg-surface" />
    </main>
  );
}

export function BusinessDashboard() {
  const business = useBusinessStore((s) => s.business);
  const status = useBusinessStore((s) => s.status);
  const error = useBusinessStore((s) => s.error);
  const fetchMine = useBusinessStore((s) => s.fetchMine);
  const [editing, setEditing] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const upgradeErrorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMine();
  }, [fetchMine]);

  useEffect(() => {
    if (upgradeError) upgradeErrorRef.current?.focus();
  }, [upgradeError]);

  // Post-registration creation: backend upgrades the user to BusinessOwner
  // and rotates tokens, so the new session in the response body must be
  // applied to the auth store — otherwise the rotated-out tokens would
  // silently log the user out.
  const submitUpgrade = async (input: BusinessInput): Promise<boolean> => {
    setUpgradeError(null);
    try {
      const res = await registerBusinessRequest(input);

      if (res.status === 409) {
        setUpgradeError("شما قبلاً یک سالن ثبت کرده‌اید.");
        return false;
      }
      if (!res.ok) {
        await res.text().catch(() => "");
        setUpgradeError("ایجاد سالن انجام نشد. اطلاعات را بررسی کنید.");
        return false;
      }
      const data: AuthResponse = await res.json();
      useAuthStore.getState().applySession(data);
      await fetchMine();
      return true;
    } catch {
      setUpgradeError("اتصال به سرور ممکن نیست. لطفاً دوباره تلاش کنید.");
      return false;
    }
  };

  if (status === "loading" || status === "idle") {
    return <LoadingState />;
  }

  if (status === "error") {
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-10 sm:py-10">
        <PageHeader
          eyebrow="سالن"
          title="خطایی رخ داد"
          description="دریافت اطلاعات سالن ممکن نشد. اتصال را بررسی کنید و دوباره تلاش کنید."
        />
        {error && <AuthError message={error} />}
        <div>
          <Button variant="secondary" size="lg" onClick={() => fetchMine()}>
            تلاش دوباره
          </Button>
        </div>
      </main>
    );
  }

  if (status === "notFound") {
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-10 sm:py-10">
        <PageHeader
          eyebrow="سالن"
          title="ارتقا به مدیر سالن"
          description="اطلاعات سالن خود را ثبت کنید تا حساب شما به مدیر سالن ارتقا پیدا کند و به پنل مدیریت خدمات، مشتریان و نوبت‌ها دسترسی پیدا کنید."
        />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="mt-8 grid w-full grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]"
        >
          <div className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-[0_20px_40px_-24px_rgba(79,70,229,0.28)] sm:p-8">
            {upgradeError && (
              <div className="mb-5">
                <AuthError ref={upgradeErrorRef} message={upgradeError} />
              </div>
            )}
            <BusinessForm mode="create" submit={submitUpgrade} onDone={() => {}} />
          </div>

          <aside
            aria-label="بعد از ثبت چه می‌شود"
            className="rounded-[1.75rem] border border-border bg-surface-subtle p-6 sm:p-7"
          >
            <h3 className="text-[15px] font-extrabold tracking-tight text-[#1e1b4b]">
              <span className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-primary-soft p-2 text-primary align-middle">
                <Store className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              بعد از ثبت چه می‌شود؟
            </h3>
            <ul className="mt-4 flex flex-col gap-3.5">
              {[
                "حساب شما به مدیر سالن ارتقا می‌یابد",
                "صفحه سالن شما در فهرست عمومی نمایش داده می‌شود",
                "به مدیریت خدمات، مشتریان و نوبت‌ها دسترسی پیدا می‌کنید",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm leading-6 font-semibold text-[#312e81]">
                  <span aria-hidden="true" className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </motion.div>
      </main>
    );
  }

  // status === "loaded"
  if (!business) return null;

  const details = [
    { icon: Building2, label: "شهر", value: business.city },
    { icon: MapPin, label: "نشانی", value: business.address },
    { icon: FileText, label: "توضیحات", value: business.description || null },
  ];

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-10 sm:py-10">
      {editing ? (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="w-full max-w-2xl">
          <PageHeader
            eyebrow="سالن"
            title="ویرایش سالن"
            description="تغییرات را اعمال کنید و ذخیره کنید. این اطلاعات در فهرست عمومی نمایش داده می‌شود."
          />
          <div className="mt-8 rounded-[1.75rem] border border-border bg-surface p-6 shadow-[0_20px_40px_-24px_rgba(79,70,229,0.28)] sm:p-8">
            <BusinessForm
              mode="edit"
              initial={business}
              onDone={() => setEditing(false)}
              onCancel={() => setEditing(false)}
            />
          </div>
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="w-full">
          <PageHeader
            eyebrow="سالن من"
            title={business.name}
            actions={
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setEditing(true)}
                aria-label="ویرایش سالن"
                title="ویرایش سالن"
                className="h-10 w-10"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </Button>
            }
          />

          {business.profileImageUrl && (
            <div className="mt-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={business.profileImageUrl}
                alt={`تصویر ${business.name}`}
                className="h-28 w-28 rounded-[1.25rem] border border-border bg-surface object-cover shadow-[0_20px_40px_-24px_rgba(79,70,229,0.35)] sm:h-32 sm:w-32"
              />
            </div>
          )}

          <div className="mt-8 w-full max-w-2xl">
            <BusinessGalleryField />
          </div>

          <dl className="mt-8 w-full max-w-2xl border-t border-border">
            {details.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="grid gap-1.5 border-b border-border-subtle py-5 sm:grid-cols-[12rem_1fr] sm:gap-4"
              >
                <dt className="flex items-center gap-2 text-[13px] font-bold text-slate-500">
                  <Icon className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  {label}
                </dt>
                <dd className="text-[15px] leading-7 font-semibold whitespace-pre-line text-[#1e1b4b]">
                  {value || <span className="font-medium text-slate-400">ثبت نشده</span>}
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>
      )}
    </main>
  );
}
