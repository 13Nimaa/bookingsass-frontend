"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthError } from "@/components/shared/auth-error";
import { PageHeader } from "@/components/shared/page-header";
import { useProfileStore } from "@/features/profile/store/profile-store";
import { roleLabel } from "@/features/profile/types";
import { ProfileAvatar } from "@/features/profile/components/profile-avatar";
import { ProfileForm } from "@/features/profile/components/profile-form";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const, delay: i * 0.07 },
  }),
};

function Skeleton() {
  return (
    <main className="mx-auto flex w-full max-w-[1140px] flex-1 flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 lg:px-8" aria-busy="true">
      <div className="h-9 w-28 animate-pulse rounded-full bg-surface-secondary motion-reduce:animate-none" />
      <div className="w-full overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="skeleton-shimmer h-[72px] bg-primary-soft sm:h-24" />
        <div className="flex flex-col gap-3 px-5 pb-5 sm:flex-row sm:items-end sm:px-6 sm:pb-6">
          <div className="skeleton-shimmer h-20 w-20 -translate-y-10 rounded-full bg-surface-secondary sm:h-24 sm:w-24 sm:-translate-y-12" />
          <div className="flex-1 space-y-2.5 pb-1">
            <div className="skeleton-shimmer h-6 w-44 rounded-lg bg-surface-secondary" />
            <div className="skeleton-shimmer h-4 w-56 rounded bg-surface-secondary" />
          </div>
        </div>
      </div>
      <div className="grid w-full grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-5">
        <div className="skeleton-shimmer h-44 rounded-2xl bg-surface lg:col-span-3" />
        <div className="skeleton-shimmer h-44 rounded-2xl bg-surface lg:col-span-2" />
      </div>
    </main>
  );
}

export function ProfileDashboard() {
  const profile = useProfileStore((s) => s.profile);
  const status = useProfileStore((s) => s.status);
  const error = useProfileStore((s) => s.error);
  const notice = useProfileStore((s) => s.notice);
  const fetchProfile = useProfileStore((s) => s.fetchProfile);
  const clearError = useProfileStore((s) => s.clearError);
  const clearNotice = useProfileStore((s) => s.clearNotice);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Auto-dismiss success notices; errors stay until acted on.
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => clearNotice(), 5000);
    return () => clearTimeout(t);
  }, [notice, clearNotice]);

  const openEdit = () => {
    clearError();
    clearNotice();
    setEditing(true);
  };

  if (status === "loading" || status === "idle") return <Skeleton />;

  if (status === "error" && !profile) {
    return (
      <main className="mx-auto flex w-full max-w-[1140px] flex-1 flex-col items-start gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <PageHeader
          eyebrow="پروفایل"
          title="خطایی رخ داد"
          description="دریافت پروفایل ممکن نشد. دوباره تلاش کنید."
        />
        {error && <AuthError message={error} />}
        <Button variant="secondary" size="lg" onClick={() => fetchProfile()}>
          تلاش دوباره
        </Button>
      </main>
    );
  }

  if (!profile) return null;

  const hasBusiness = profile.businessId != null;
  const hasEmployee = profile.employeeId != null;

  return (
    <main className="mx-auto flex w-full max-w-[1140px] flex-1 flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 lg:px-8">
      <PageHeader
        eyebrow="حساب کاربری"
        title="پروفایل"
        description="اطلاعات حساب، تصویر پروفایل و نقش‌های خود را مدیریت کنید."
        actions={
          !editing ? (
            <Button
              variant="secondary"
              size="lg"
              onClick={openEdit}
              className="max-sm:h-10 max-sm:px-4 max-sm:text-sm"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              ویرایش پروفایل
            </Button>
          ) : undefined
        }
      />

      {notice && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          role="status"
          className="flex w-full items-center gap-2.5 rounded-2xl border border-success-border bg-success-soft px-4 py-3 text-sm font-semibold text-success-text"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
          {notice}
        </motion.div>
      )}
      {error && (
        <div className="w-full">
          <AuthError message={error} />
        </div>
      )}

      {/* ── Hero card ─────────────────────────────────────────── */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={1}
        aria-label="خلاصه پروفایل"
        className="w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(30,27,75,0.06)]"
      >
        {/* Banner — soft brand tint, deliberately quiet */}
        <div aria-hidden="true" className="relative h-[72px] border-b border-primary-subtle/60 bg-primary-soft sm:h-24">
          <div className="absolute inset-0 bg-[radial-gradient(420px_120px_at_85%_0%,rgba(79,70,229,0.12),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(360px_130px_at_12%_100%,rgba(79,70,229,0.07),transparent)]" />
        </div>

        <div className="px-5 pt-0 pb-5 sm:px-6 sm:pb-6">
          <div className="-mt-10 flex flex-col items-center gap-3 sm:-mt-12 sm:flex-row sm:items-end sm:gap-5">
            <ProfileAvatar name={profile.fullName} imageUrl={profile.profileImageUrl} />
            <div className="pb-1 text-center sm:text-start">
              <h2 className="flex items-center justify-center gap-1.5 text-xl font-bold tracking-tight text-[#1e1b4b] sm:justify-start sm:text-2xl">
                {profile.fullName}
                <BadgeCheck className="h-5 w-5 shrink-0 text-primary" aria-label="حساب تأییدشده" />
              </h2>
              <p dir="ltr" className="tnum mt-1 text-center text-sm font-semibold text-slate-600 sm:text-right">
                {profile.phoneNumber ?? "—"}
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
                {profile.roles.length > 0 ? (
                  profile.roles.map((r) => (
                    <span
                      key={r}
                      className="inline-flex items-center gap-1 rounded-full border border-primary-subtle bg-primary-soft px-2.5 py-1 text-[12px] font-bold text-primary"
                    >
                      <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                      {roleLabel(r)}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full border border-dashed border-border-strong bg-surface-subtle px-2.5 py-1 text-[12px] font-semibold text-slate-500">
                    بدون نقش
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Detail grid — fractional 3/2 split ────────────────── */}
      <div className="grid w-full grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-5">
        {/* Contact / editable panel */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          aria-label={editing ? "ویرایش اطلاعات" : "اطلاعات تماس"}
          className="rounded-2xl border border-border bg-surface p-5 sm:p-6 lg:col-span-3"
        >
          {editing ? (
            <>
              <h3 className="text-lg font-bold tracking-tight text-[#1e1b4b]">
                ویرایش پروفایل
              </h3>
              <p className="mt-1 mb-5 text-[13px] leading-6 font-medium text-slate-600">
                نام و ایمیل خود را به‌روز کنید و ذخیره کنید.
              </p>
              <ProfileForm
                profile={profile}
                onDone={() => setEditing(false)}
                onCancel={() => setEditing(false)}
              />
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold tracking-tight text-[#1e1b4b]">اطلاعات تماس</h3>
              <p className="mt-1 text-[13px] leading-6 font-medium text-slate-600">
                راه‌های ارتباطی ثبت‌شده برای حساب شما.
              </p>
              <dl className="mt-4 space-y-1">
                <div className="flex items-center gap-3 rounded-xl px-2.5 py-3 transition-colors hover:bg-surface-subtle">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-[12px] font-bold text-slate-500">شماره موبایل</dt>
                    <dd dir="ltr" className="tnum mt-0.5 truncate text-right text-[15px] font-bold text-[#1e1b4b]">
                      {profile.phoneNumber ?? "—"}
                    </dd>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl px-2.5 py-3 transition-colors hover:bg-surface-subtle">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Mail className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-[12px] font-bold text-slate-500">ایمیل</dt>
                    {profile.email ? (
                      <dd dir="ltr" className="mt-0.5 truncate text-right text-[15px] font-bold text-[#1e1b4b]">
                        {profile.email}
                      </dd>
                    ) : (
                      <dd className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-dashed border-primary/40 bg-primary-soft px-2.5 py-0.5 text-[12px] font-bold text-primary">
                          ثبت نشده
                        </span>
                        <button
                          type="button"
                          onClick={openEdit}
                          className="text-[12px] font-bold text-primary underline-offset-4 transition hover:text-primary-hover hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                          افزودن ایمیل
                        </button>
                      </dd>
                    )}
                  </div>
                </div>
              </dl>
            </>
          )}
        </motion.section>

        {/* Account panel */}
        <motion.aside
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          aria-label="وضعیت حساب"
          className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 sm:p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-bold tracking-tight text-[#1e1b4b]">حساب من</h3>

          <div
            className={`flex items-start gap-3 rounded-xl border p-4 ${
              hasBusiness
                ? "border-success-border bg-success-soft"
                : "border-border-subtle bg-surface-subtle"
            }`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-subtle ${
                hasBusiness ? "bg-surface text-success" : "bg-surface text-slate-500"
              }`}
            >
              <Store className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold text-[#1e1b4b]">کسب‌وکار</p>
              <p className="mt-0.5 text-[13px] leading-6 font-medium text-slate-600">
                {hasBusiness ? "شما یک کسب‌وکار ثبت کرده‌اید." : "هنوز کسب‌وکاری ثبت نکرده‌اید."}
              </p>
              <Link
                href="/dashboard/business"
                className="mt-1.5 inline-block text-[13px] font-bold text-primary transition hover:text-primary-hover"
              >
                {hasBusiness ? "مدیریت کسب‌وکار ←" : "ثبت کسب‌وکار ←"}
              </Link>
            </div>
          </div>

          <div
            className={`flex items-start gap-3 rounded-xl border p-4 ${
              hasEmployee
                ? "border-info-border bg-info-soft"
                : "border-border-subtle bg-surface-subtle"
            }`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-subtle ${
                hasEmployee ? "bg-surface text-info" : "bg-surface text-slate-500"
              }`}
            >
              <Briefcase className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold text-[#1e1b4b]">همکاری</p>
              <p className="mt-0.5 text-[13px] leading-6 font-medium text-slate-600">
                {hasEmployee
                  ? "شما به‌عنوان کارمند در یک مجموعه فعال هستید."
                  : "در هیچ مجموعه‌ای به‌عنوان کارمند ثبت نشده‌اید."}
              </p>
            </div>
          </div>

          <p className="mt-auto pt-2 text-[12px] leading-5 font-medium text-slate-400">
            تصویر پروفایل در پوشه ابری «booking-saas/profiles» ذخیره می‌شود.
          </p>
        </motion.aside>
      </div>
    </main>
  );
}
