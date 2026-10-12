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
import { useProfileStore } from "@/features/profile/store/profile-store";
import { roleLabel } from "@/features/profile/types";
import { ProfileAvatar } from "@/features/profile/components/profile-avatar";
import { ProfileForm } from "@/features/profile/components/profile-form";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const, delay: i * 0.07 },
  }),
};

function Skeleton() {
  return (
    <main className="flex flex-1 flex-col gap-6 p-6 sm:p-10" aria-busy="true">
      <div className="w-full overflow-hidden rounded-3xl border border-border bg-surface">
        <div className="h-28 animate-pulse bg-surface-secondary motion-reduce:animate-none" />
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-end">
          <div className="h-24 w-24 -translate-y-8 animate-pulse rounded-full bg-surface-secondary motion-reduce:animate-none" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-40 animate-pulse rounded bg-surface-secondary motion-reduce:animate-none" />
            <div className="h-4 w-56 animate-pulse rounded bg-surface-secondary motion-reduce:animate-none" />
          </div>
        </div>
      </div>
      <div className="grid w-full gap-4 sm:grid-cols-2">
        <div className="h-36 animate-pulse rounded-2xl bg-surface motion-reduce:animate-none" />
        <div className="h-36 animate-pulse rounded-2xl bg-surface motion-reduce:animate-none" />
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

  if (status === "loading" || status === "idle") return <Skeleton />;

  if (status === "error" && !profile) {
    return (
      <main className="flex flex-1 flex-col items-start gap-4 p-6 sm:p-10">
        <h1 className="font-display text-3xl font-bold text-foreground">پروفایل</h1>
        {error && <AuthError message={error} />}
        <Button variant="secondary" onClick={() => fetchProfile()}>
          تلاش دوباره
        </Button>
      </main>
    );
  }

  if (!profile) return null;

  const hasBusiness = profile.businessId != null;
  const hasEmployee = profile.employeeId != null;

  return (
    <main className="flex flex-col gap-6 p-6 ">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="w-full "
      >
        <h1 className="font-display text-3xl font-bold text-foreground">پروفایل</h1>
        <p className="mt-2 text-sm text-muted">
          اطلاعات حساب، تصویر پروفایل و نقش‌های خود را مدیریت کنید.
        </p>
      </motion.div>

      {notice && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          role="status"
          className="flex w-full  items-center gap-2 rounded-xl border border-success-border bg-success-soft px-4 py-3 text-sm text-success-text"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {notice}
        </motion.div>
      )}
      {error && (
        <div className="w-full ">
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
        className="w-full overflow-hidden rounded-3xl border border-border bg-surface shadow-[0_1px_2px_rgba(17,24,39,0.05)]"
      >
        {/* Banner */}
        <div
          aria-hidden="true"
          className="relative h-28 bg-gradient-to-l from-primary via-primary-pressed to-premium sm:h-32"
        >
          <div className="absolute inset-0 bg-[radial-gradient(420px_140px_at_85%_0%,rgba(255,255,255,0.22),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(360px_160px_at_12%_100%,rgba(255,255,255,0.12),transparent)]" />
        </div>

        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="-mt-16 flex flex-col items-center gap-3 sm:-mt-14 sm:flex-row sm:items-end sm:gap-5">
            <ProfileAvatar name={profile.fullName} imageUrl={profile.profileImageUrl} />
            <div className="pb-1 text-center sm:text-start">
              <h2 className="flex items-center justify-center gap-1.5 text-xl font-bold text-foreground sm:justify-start">
                {profile.fullName}
                <BadgeCheck className="h-5 w-5 text-primary" aria-label="حساب تأییدشده" />
              </h2>
              <p dir="ltr" className="mt-1 text-sm text-muted">
                {profile.phoneNumber ?? "—"}
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
                {profile.roles.length > 0 ? (
                  profile.roles.map((r) => (
                    <span
                      key={r}
                      className="inline-flex items-center gap-1 rounded-full border border-primary-subtle bg-primary-soft px-2.5 py-1 text-[11px] font-medium text-primary"
                    >
                      <ShieldCheck className="h-3 w-3" />
                      {roleLabel(r)}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full bg-surface-secondary px-2.5 py-1 text-[11px] text-muted">
                    بدون نقش
                  </span>
                )}
              </div>
            </div>
          </div>

          {!editing && (
            <Button
              variant="secondary"
              onClick={() => {
                clearError();
                clearNotice();
                setEditing(true);
              }}
              className="shrink-0 self-center sm:self-auto"
            >
              <Pencil className="h-4 w-4" />
              ویرایش پروفایل
            </Button>
          )}
        </div>
      </motion.section>

      {/* ── Detail grid ───────────────────────────────────────── */}
      <div className="grid w-full gap-4 lg:grid-cols-2">
        {/* Contact / editable panel */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          aria-label={editing ? "ویرایش اطلاعات" : "اطلاعات تماس"}
          className="rounded-2xl border border-border w-full bg-surface p-6 lg:col-span-3"
        >
          {editing ? (
            <>
              <h3 className="mb-1 text-base font-semibold text-foreground">
                ویرایش پروفایل
              </h3>
              <p className="mb-6 text-xs leading-5 text-muted">
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
              <h3 className="text-base font-semibold text-foreground">اطلاعات تماس</h3>
              <dl className="mt-4 space-y-1">
                <div className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-surface-subtle">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Phone className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-[11px] text-muted">شماره موبایل</dt>
                    <dd dir="ltr" className="truncate text-right text-sm font-medium text-foreground">
                      {profile.phoneNumber ?? "—"}
                    </dd>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-surface-subtle">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Mail className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-[11px] text-muted">ایمیل</dt>
                    <dd dir="ltr" className="truncate text-right text-sm font-medium text-foreground">
                      {profile.email || (
                        <span className="text-text-disabled">ثبت نشده — از ویرایش اضافه کنید</span>
                      )}
                    </dd>
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
          className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6 lg:col-span-2"
        >
          <h3 className="text-base font-semibold text-foreground">حساب من</h3>

          <div
            className={`flex items-start gap-3 rounded-xl border p-4 ${
              hasBusiness
                ? "border-success-border bg-success-soft"
                : "border-border-subtle bg-surface-subtle"
            }`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                hasBusiness ? "bg-surface text-success" : "bg-surface text-muted"
              }`}
            >
              <Store className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">کسب‌وکار</p>
              <p className="mt-0.5 text-xs leading-5 text-muted">
                {hasBusiness ? "شما یک کسب‌وکار ثبت کرده‌اید." : "هنوز کسب‌وکاری ثبت نکرده‌اید."}
              </p>
              <Link
                href="/dashboard/business"
                className="mt-2 inline-block text-xs font-medium text-primary transition hover:text-primary-hover"
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
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                hasEmployee ? "bg-surface text-info" : "bg-surface text-muted"
              }`}
            >
              <Briefcase className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">همکاری</p>
              <p className="mt-0.5 text-xs leading-5 text-muted">
                {hasEmployee
                  ? "شما به‌عنوان کارمند در یک مجموعه فعال هستید."
                  : "در هیچ مجموعه‌ای به‌عنوان کارمند ثبت نشده‌اید."}
              </p>
            </div>
          </div>

          <p className="mt-auto pt-2 text-[11px] leading-5 text-text-disabled">
            تصویر پروفایل در پوشه ابری «booking-saas/profiles» ذخیره می‌شود.
          </p>
        </motion.aside>
      </div>
    </main>
  );
}
