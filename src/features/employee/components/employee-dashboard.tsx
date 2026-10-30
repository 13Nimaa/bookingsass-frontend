"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CalendarClock,
  Check,
  ChevronLeft,
  Clock3,
  Loader2,
  Phone,
  Store,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useBusinessStore } from "@/features/business/store/business-store";
import { useEmployeeStore } from "@/features/employee/store/employee-store";
import { useProfileStore } from "@/features/profile/store/profile-store";
import { formatGregorianIsoToJalali } from "@/features/employee/lib/jalali-date";
import { toTimeInput } from "@/features/employee/lib/schedule";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { AuthError } from "@/components/shared/auth-error";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddEmployeeDialog } from "@/features/employee/components/add-employee-dialog";
import { WeeklyScheduleDialog } from "@/features/employee/components/weekly-schedule-dialog";
import type { EmployeeDto, WorkingHourDto } from "@/features/employee/types";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as const,
      delay: index * 0.05,
    },
  }),
};
function initialsOf(name: string) {
  const names = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return names.length ? names.map((item) => item[0]).join("") : "ک";
}
function formatPersianTime(value: string) {
  return toTimeInput(value).replace(
    /\d/g,
    (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)],
  );
}

function scheduleSummary(hours: WorkingHourDto[]) {
  if (!hours.length) return null;
  const sorted = [...hours].sort(
    (a, b) =>
      (a.date ?? "").localeCompare(b.date ?? "") ||
      a.startTime.localeCompare(b.startTime),
  );
  const dates = [
    ...new Set(sorted.flatMap((item) => (item.date ? [item.date] : []))),
  ];
  const first = sorted[0];
  const sameTime = sorted.every(
    (item) =>
      toTimeInput(item.startTime) === toTimeInput(first.startTime) &&
      toTimeInput(item.endTime) === toTimeInput(first.endTime),
  );
  const dateText =
    dates.length === 0
      ? "تاریخ ثبت نشده"
      : dates.length === 1
        ? formatGregorianIsoToJalali(dates[0])
        : `${formatGregorianIsoToJalali(dates[0])} تا ${formatGregorianIsoToJalali(dates.at(-1)!)}`;
  return sameTime
    ? `${dateText}، ${formatPersianTime(first.startTime)} تا ${formatPersianTime(first.endTime)}`
    : dates.length
      ? `${dates.length.toLocaleString("fa-IR")} تاریخ و ${sorted.length.toLocaleString("fa-IR")} بازهٔ کاری`
      : `${sorted.length.toLocaleString("fa-IR")} بازهٔ کاری (تاریخ ثبت نشده)`;
}

function LoadingState() {
  return (
    <main
      className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-10 sm:py-10"
      aria-busy="true"
    >
      <div className="h-5 w-32 animate-pulse rounded bg-surface-secondary" />
      <div className="skeleton-shimmer h-10 w-56 rounded-xl bg-surface-secondary" />
      <div className="grid gap-3 md:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="skeleton-shimmer h-40 rounded-[1.75rem] bg-surface"
          />
        ))}
      </div>
    </main>
  );
}

function EmployeeCard({
  employee,
  hours,
  isCurrentUser,
  removing,
  onSchedule,
  onRemove,
}: {
  employee: EmployeeDto;
  hours: WorkingHourDto[];
  isCurrentUser: boolean;
  removing: boolean;
  onSchedule: () => void;
  onRemove: () => void;
}) {
  const summary = scheduleSummary(hours);
  return (
    <li className="group flex min-h-44 flex-col rounded-[1.75rem] border border-border bg-surface p-5 shadow-[0_12px_30px_-28px_rgba(30,27,75,0.5)] transition-all hover:border-border-strong hover:shadow-[0_20px_36px_-28px_rgba(79,70,229,0.38)]">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-[15px] font-extrabold text-primary ring-1 ring-primary-subtle ring-inset"
        >
          {initialsOf(employee.fullName)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-[16px] font-extrabold text-text-primary">
              {employee.fullName}
            </p>
            {isCurrentUser && (
              <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-text-secondary">
                شما
              </span>
            )}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold text-muted">
            <Phone className="h-3.5 w-3.5" />
            <span dir="ltr" className="tnum">
              {employee.phoneNumber}
            </span>
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          aria-label={`حذف ${employee.fullName}`}
          title="حذف کارمند"
          className="h-10 w-10 text-slate-400 hover:bg-error-soft hover:text-error"
          onClick={onRemove}
          disabled={removing}
        >
          {removing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div
        className="mt-5 flex items-center gap-2 text-[13px] font-bold"
        dir="rtl"
      >
        {summary ? (
          <>
            <Clock3 className="h-4 w-4 shrink-0 text-primary" />
            <span className="text-text-primary">{summary}</span>
          </>
        ) : (
          <span className="rounded-lg bg-warning-soft px-2.5 py-1.5 text-warning-text">
            برنامه تنظیم نشده
          </span>
        )}
      </div>
      <div className="mt-auto pt-5">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="h-10 w-full gap-2 font-bold"
          onClick={onSchedule}
        >
          <CalendarClock className="h-4 w-4" /> برنامهٔ کاری
        </Button>
      </div>
    </li>
  );
}

export function EmployeeDashboard() {
  const router = useRouter();
  const business = useBusinessStore((s) => s.business);
  const businessStatus = useBusinessStore((s) => s.status);
  const businessError = useBusinessStore((s) => s.error);
  const fetchMine = useBusinessStore((s) => s.fetchMine);
  const employees = useEmployeeStore((s) => s.employees);
  const status = useEmployeeStore((s) => s.status);
  const error = useEmployeeStore((s) => s.error);
  const notice = useEmployeeStore((s) => s.notice);
  const removingId = useEmployeeStore((s) => s.removingId);
  const hoursByEmployee = useEmployeeStore((s) => s.workingHoursByEmployee);
  const fetchEmployees = useEmployeeStore((s) => s.fetchEmployees);
  const loadSchedule = useEmployeeStore((s) => s.loadSchedule);
  const removeEmployee = useEmployeeStore((s) => s.removeEmployee);
  const clearNotice = useEmployeeStore((s) => s.clearNotice);
  const reset = useEmployeeStore((s) => s.reset);
  const profile = useProfileStore((s) => s.profile);
  const fetchProfile = useProfileStore((s) => s.fetchProfile);
  const [addOpen, setAddOpen] = useState(false);
  const [scheduleEmployee, setScheduleEmployee] = useState<EmployeeDto | null>(
    null,
  );
  const [confirmEmployee, setConfirmEmployee] = useState<EmployeeDto | null>(
    null,
  );
  const businessId = business?.id;
  useEffect(() => {
    void fetchMine();
    void fetchProfile();
  }, [fetchMine, fetchProfile]);
  useEffect(() => {
    if (businessId) void fetchEmployees(businessId);
  }, [businessId, fetchEmployees]);
  useEffect(() => {
    if (businessId && status === "loaded")
      employees.forEach((employee) => {
        if (!hoursByEmployee[employee.id])
          void loadSchedule(businessId, employee.id);
      });
  }, [businessId, employees, hoursByEmployee, loadSchedule, status]);
  useEffect(() => () => reset(), [reset]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(clearNotice, 4000);
    return () => window.clearTimeout(timer);
  }, [notice, clearNotice]);
  const staffCount = useMemo(
    () => employees.length.toLocaleString("fa-IR"),
    [employees.length],
  );

  if (businessStatus === "idle" || businessStatus === "loading")
    return <LoadingState />;
  if (businessStatus === "error")
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-10 sm:py-10">
        <PageHeader
          title="کارکنان"
          description="برای مدیریت کارکنان، ابتدا باید اطلاعات کسب‌وکار شما دریافت شود."
        />
        {businessError && <AuthError message={businessError} />}
        <div>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => void fetchMine()}
          >
            تلاش دوباره
          </Button>
        </div>
      </main>
    );
  if (businessStatus === "notFound" || !business)
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-10 sm:py-10">
        <PageHeader
          title="کارکنان"
          description="مدیریت کارکنان و برنامهٔ کاری آن‌ها."
        />
        <div className="mt-8 flex flex-col items-center gap-4 rounded-[1.75rem] border border-dashed border-border-strong bg-surface-subtle px-6 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Store className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-[17px] font-extrabold text-text-primary">
              ابتدا کسب‌وکار خود را ثبت کنید
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 font-medium text-muted">
              پس از ثبت کسب‌وکار می‌توانید کارکنان و برنامهٔ کاری آن‌ها را
              مدیریت کنید.
            </p>
          </div>
          <Button
            size="lg"
            className="h-11 px-6 font-bold"
            onClick={() => router.push("/dashboard/business")}
          >
            ثبت کسب‌وکار
          </Button>
        </div>
      </main>
    );
  const initialLoading =
    (status === "idle" || status === "loading") && employees.length === 0;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-10 sm:py-10">
      <nav
        aria-label="مسیر صفحه"
        className="mb-4 flex items-center gap-1 text-[13px] font-bold text-muted"
      >
        <span>داشبورد</span>
        <ChevronLeft className="h-3.5 w-3.5" />
        <span className="text-text-secondary">کارکنان</span>
      </nav>
      <PageHeader
        title="کارکنان"
        badge={
          <span className="rounded-full bg-primary-soft px-3 py-1 text-[13px] font-bold text-text-secondary">
            {staffCount} کارمند
          </span>
        }
        description="کارکنان مجموعه و برنامهٔ کاری هفتگی هرکدام را در یک‌جا مدیریت کنید."
        actions={
          <Button
            size="lg"
            className="h-11 px-5 font-bold"
            onClick={() => setAddOpen(true)}
          >
            <UserPlus className="h-4 w-4" />
            افزودن کارمند
          </Button>
        }
      />
      <div className="mt-6 flex flex-col gap-3">
        {notice && (
          <div
            role="status"
            className="flex items-center gap-2.5 rounded-2xl border border-success-border bg-success-soft px-4 py-3 text-[13px] font-bold text-success-text"
          >
            <Check className="h-4 w-4" />
            {notice}
          </div>
        )}
        {error && !addOpen && <AuthError message={error} />}
      </div>
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mt-6 w-full"
      >
        {initialLoading ? (
          <div className="grid gap-3 md:grid-cols-2" aria-busy="true">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="skeleton-shimmer h-44 rounded-[1.75rem] bg-surface"
              />
            ))}
          </div>
        ) : status === "error" && employees.length === 0 ? (
          <div className="rounded-[1.75rem] border border-error-border bg-error-soft p-6">
            <AuthError message={error ?? "دریافت فهرست کارکنان ممکن نشد."} />
            <Button
              variant="secondary"
              size="lg"
              className="mt-4"
              onClick={() => void fetchEmployees(business.id)}
            >
              تلاش دوباره
            </Button>
          </div>
        ) : employees.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-[1.75rem] border border-dashed border-border-strong bg-surface-subtle px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Users className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-[17px] font-extrabold text-text-primary">
                هنوز کارمندی اضافه نشده است
              </h2>
              <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 font-medium text-muted">
                با شمارهٔ موبایل، اعضای تیم خود را به مجموعه اضافه کنید.
              </p>
            </div>
            <Button
              size="lg"
              className="h-11 px-6 font-bold"
              onClick={() => setAddOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
              افزودن کارمند
            </Button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {employees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                hours={hoursByEmployee[employee.id] ?? []}
                isCurrentUser={profile?.id === employee.userId}
                removing={removingId === employee.id}
                onSchedule={() => setScheduleEmployee(employee)}
                onRemove={() => setConfirmEmployee(employee)}
              />
            ))}
          </ul>
        )}
      </motion.div>
      <AddEmployeeDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        businessId={business.id}
      />
      <WeeklyScheduleDialog
        open={scheduleEmployee !== null}
        onOpenChange={(next) => {
          if (!next) setScheduleEmployee(null);
        }}
        businessId={business.id}
        employee={scheduleEmployee}
      />
      <ConfirmDialog
        open={confirmEmployee !== null}
        onOpenChange={(next) => {
          if (!next) setConfirmEmployee(null);
        }}
        title="حذف کارمند"
        description={
          confirmEmployee
            ? `آیا از حذف «${confirmEmployee.fullName}» مطمئن هستید؟ برنامهٔ کاری او نیز حذف می‌شود و نقش کاربری‌اش به مشتری تغییر می‌کند.`
            : ""
        }
        confirmLabel="حذف"
        loading={removingId !== null}
        onConfirm={async () => {
          if (
            confirmEmployee &&
            (await removeEmployee(business.id, confirmEmployee.id))
          )
            setConfirmEmployee(null);
        }}
      />
      <span className="sr-only" role="status" aria-live="polite">
        {notice ?? ""}
      </span>
    </main>
  );
}
