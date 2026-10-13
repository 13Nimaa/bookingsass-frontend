"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useBusinessStore } from "@/features/business/store/business-store";
import { BusinessForm } from "@/features/business/components/business-form";
import { Button } from "@/components/ui/button";
import { AuthError } from "@/components/shared/auth-error";
import { PageHeader } from "@/components/shared/page-header";
import { ArrowLeft, MapPin, Building2, Pencil, Store, FileText } from "lucide-react";

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
      <div className="h-9 w-28 animate-pulse rounded-full bg-surface-secondary motion-reduce:animate-none" />
      <div className="skeleton-shimmer h-10 w-64 rounded-xl bg-surface-secondary" />
      <div className="skeleton-shimmer h-4 w-full max-w-md rounded bg-surface-secondary" />
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

  useEffect(() => {
    fetchMine();
  }, [fetchMine]);

  if (status === "loading" || status === "idle") {
    return <LoadingState />;
  }

  if (status === "error") {
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-10 sm:py-10">
        <PageHeader
          eyebrow="کسب‌وکار"
          title="خطایی رخ داد"
          description="دریافت اطلاعات کسب‌وکار ممکن نشد. اتصال را بررسی کنید و دوباره تلاش کنید."
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
          eyebrow="کسب‌وکار"
          title="کسب‌وکار خود را بسازید"
          description="هنوز کسب‌وکاری نساخته‌اید. با ثبت سالن، حساب شما به مدیر آرایشگاه ارتقا پیدا می‌کند."
        />

        {/* ── Upgrade CTA — asymmetric, single accent, diffusion shadow ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="mt-8 grid w-full grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]"
        >
          <div className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-[0_20px_40px_-24px_rgba(79,70,229,0.28)] sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-primary-soft p-3.5 text-primary">
                <Store className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="text-[17px] font-extrabold tracking-tight text-[#1e1b4b]">
                  می‌خواهید آرایشگاه خود را مدیریت کنید؟
                </h2>
                <p className="mt-1.5 max-w-[52ch] text-sm leading-7 font-medium text-slate-600">
                  اطلاعات سالن خود را ثبت کنید تا حساب شما به «مدیر آرایشگاه» تبدیل شود و به
                  پنل مدیریت خدمات، مشتریان و نوبت‌ها دسترسی پیدا کنید.
                </p>
              </div>
            </div>

            <Link
              href="/register/business"
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-[15px] font-bold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:translate-y-px active:scale-[0.98] sm:w-auto"
            >
              ثبت‌نام به عنوان مدیر آرایشگاه
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <aside
            aria-label="بعد از ثبت چه می‌شود"
            className="rounded-[1.75rem] border border-border bg-surface-subtle p-6 sm:p-7"
          >
            <h3 className="text-[15px] font-extrabold tracking-tight text-[#1e1b4b]">
              بعد از ثبت چه می‌شود؟
            </h3>
            <ul className="mt-4 flex flex-col gap-3.5">
              {[
                "حساب شما به مدیر آرایشگاه ارتقا می‌یابد",
                "صفحه کسب‌وکار شما در فهرست عمومی نمایش داده می‌شود",
                "به‌زودی: مدیریت خدمات، مشتریان و نوبت‌ها",
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
            eyebrow="کسب‌وکار"
            title="ویرایش کسب‌وکار"
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
            eyebrow="کسب‌وکار من"
            title={business.name}
            description="مشخصات ثبت‌شده سالن شما. برای به‌روزرسانی، ویرایش را بزنید."
            actions={
              <Button variant="secondary" size="lg" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
                ویرایش
              </Button>
            }
          />

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
