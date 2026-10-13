import Link from "next/link";
import { ArrowLeft, Store, UserRound, Activity } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";

const QUICK_ACTIONS = [
  {
    href: "/dashboard/profile",
    icon: UserRound,
    title: "تکمیل پروفایل",
    description: "نام، ایمیل و تصویر پروفایل خود را به‌روز نگه دارید تا مشتریان به شما اعتماد کنند.",
    cta: "مدیریت پروفایل",
  },
  {
    href: "/dashboard/business",
    icon: Store,
    title: "مدیریت کسب‌وکار",
    description: "مشخصات سالن، شهر و نشانی را ثبت کنید و حساب خود را به مدیر آرایشگاه ارتقا دهید.",
    cta: "مدیریت کسب‌وکار",
  },
] as const;

export default function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-10 sm:py-10">
      <PageHeader
        hideBack
        eyebrow="نمای کلی"
        title="داشبورد"
        description="از اینجا پروفایل و کسب‌وکار خود را مدیریت کنید. هر بخش را باز کنید و مرحله‌به‌مرحله جلو بروید."
      />

      {/* Asymmetric 2fr / 1fr — no centered hero, no 3-card row */}
      <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr] lg:gap-6">
        {/* ── Quick actions ── */}
        <section
          aria-label="شروع سریع"
          className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-[0_20px_40px_-24px_rgba(79,70,229,0.28)] sm:p-8"
        >
          <h2 className="text-[17px] font-extrabold tracking-tight text-[#1e1b4b]">
            شروع سریع
          </h2>
          <p className="mt-1.5 text-sm leading-6 font-medium text-slate-600">
            دو قدمی که بیشتر مدیران اول برمی‌دارند — از همین‌جا ادامه دهید.
          </p>

          <div className="mt-6 flex flex-col divide-y divide-border-subtle border-y border-border-subtle">
            {QUICK_ACTIONS.map(({ href, icon: Icon, title, description, cta }, i) => (
              <Link
                key={href}
                href={href}
                className={`group flex items-start gap-4 py-5 transition-colors first:pt-1 last:pb-1 hover:bg-surface-subtle/60 ${
                  i === 0 ? "" : ""
                }`}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary-subtle bg-primary-soft text-primary transition-transform duration-300 group-hover:scale-105 group-active:scale-[0.97]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-[15px] font-bold text-[#1e1b4b]">{title}</span>
                    <ArrowLeft
                      className="h-4 w-4 shrink-0 text-slate-400 transition-all duration-200 group-hover:-translate-x-1 group-hover:text-primary"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="mt-1 block text-sm leading-6 font-medium text-slate-600">
                    {description}
                  </span>
                  <span className="mt-2 inline-block text-[13px] font-bold text-primary group-hover:text-primary-hover">
                    {cta}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Account status ── */}
        <aside
          aria-label="وضعیت حساب"
          className="flex flex-col rounded-[1.75rem] bg-primary p-6 text-white shadow-[0_20px_40px_-20px_rgba(79,70,229,0.55)] ring-1 ring-white/15 ring-inset sm:p-7"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <h2 className="text-[15px] font-extrabold tracking-tight text-white">
              وضعیت حساب
            </h2>
          </div>
          <p className="mt-2 text-sm leading-6 font-medium text-indigo-100">
            حساب شما فعال است. برای باز شدن کامل پنل مدیریت، هر دو مرحله زیر را کامل کنید.
          </p>

          <ul className="mt-5 flex flex-col gap-3">
            {[
              { label: "پروفایل کاربری", href: "/dashboard/profile" },
              { label: "اطلاعات کسب‌وکار", href: "/dashboard/business" },
            ].map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition-all duration-200 hover:border-white/30 hover:bg-white/15 active:scale-[0.98]"
                >
                  {label}
                  <ArrowLeft className="h-4 w-4 text-indigo-100" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-auto flex items-center gap-1.5 pt-6 text-[12px] leading-5 font-medium text-indigo-100">
            <Activity className="h-3.5 w-3.5" aria-hidden="true" />
            ورود شما ذخیره شده و نشست فعال است.
          </p>
        </aside>
      </div>
    </main>
  );
}
