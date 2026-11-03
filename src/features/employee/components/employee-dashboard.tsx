"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CalendarClock,
  Check,
  ChevronLeft,
  Loader2,
  Phone,
  Sparkles,
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
import { cn } from "cn";
import { AuthError } from "@/components/shared/auth-error";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddEmployeeDialog } from "@/features/employee/components/add-employee-dialog";
import { WeeklyScheduleDialog } from "@/features/employee/components/weekly-schedule-dialog";
import { EmployeeServicesDrawer } from "@/features/employee/components/employee-services-drawer";
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

function EmployeeCardSkeleton() {
  return (
    <li
      aria-hidden="true"
      className="flex h-full min-h-[13.5rem] flex-col rounded-2xl border border-border bg-surface"
    >
      <div className="flex items-start gap-3 p-4 sm:p-5">
        <span className="skeleton-shimmer block h-12 w-12 shrink-0 rounded-full bg-surface-secondary" />
        <div className="flex-1 space-y-2.5 pt-1">
          <span className="skeleton-shimmer block h-3.5 w-32 rounded bg-surface-secondary" />
          <span className="skeleton-shimmer block h-3 w-24 rounded bg-surface-secondary" />
        </div>
      </div>
      <div className="mt-auto border-t border-border-subtle px-4 py-4 sm:px-5">
        <span className="skeleton-shimmer block h-6 w-28 rounded-md bg-surface-secondary" />
        <span className="skeleton-shimmer mt-3 block h-3 w-4/5 rounded bg-surface-secondary" />
        <span className="skeleton-shimmer mt-4 block h-10 w-full rounded-xl bg-surface-secondary" />
      </div>
    </li>
  );
}

function LoadingState() {
  return (
    <main
      className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
      aria-busy="true"
    >
      <PageHeader title="کارکنان" description="در حال بارگذاری…" />
      <ul className="grid grid-cols-1 gap-4 min-[920px]:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <EmployeeCardSkeleton key={item} />
        ))}
      </ul>
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
  onServices,
}: {
  employee: EmployeeDto;
  hours: WorkingHourDto[];
  isCurrentUser: boolean;
  removing: boolean;
  onSchedule: () => void;
  onRemove: () => void;
  onServices: () => void;
}) {
  const summary = scheduleSummary(hours);
  const configured = Boolean(summary);

  return (
    <li className="group flex h-full min-h-[13.5rem] flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-[border-color,box-shadow,background-color] duration-150 hover:border-border-strong hover:bg-surface-hover hover:shadow-[0_18px_36px_-30px_rgba(30,27,75,0.55)] focus-within:border-border-strong motion-reduce:transition-none">
      <div className="flex items-start gap-3 p-4 sm:p-5">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[14px] font-extrabold text-primary ring-1 ring-primary-subtle ring-inset"
        >
          {initialsOf(employee.fullName)}
        </span>

        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex min-w-0 items-center gap-2">
            <p
              className="truncate text-[15px] leading-6 font-extrabold text-text-primary"
              title={employee.fullName}
            >
              {employee.fullName}
            </p>
            {isCurrentUser && (
              <span className="shrink-0 rounded-md border border-border bg-surface-secondary px-1.5 py-0.5 text-[10.5px] leading-4 font-bold text-muted">
                شما
              </span>
            )}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-[12.5px] leading-5 font-medium text-muted">
            <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span dir="ltr" className="tnum tracking-wide">
              {employee.phoneNumber}
            </span>
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`حذف ${employee.fullName}`}
          title="حذف کارمند"
          className="h-9 w-9 shrink-0 rounded-lg text-text-disabled transition-colors hover:bg-error-soft hover:text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
          onClick={onRemove}
          disabled={removing}
        >
          {removing ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>

      <div className="mt-auto border-t border-border-subtle px-4 py-4 sm:px-5">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] leading-4 font-bold ring-1 ring-inset",
            configured
              ? "bg-success-soft text-success-text ring-success-border"
              : "bg-warning-soft text-warning-text ring-warning-border",
          )}
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-current"
          />
          {configured ? "برنامه تنظیم شده" : "برنامه تنظیم نشده"}
        </span>

        <p className="mt-2 text-[12.5px] leading-6 font-medium break-words text-muted">
          {summary ?? "ساعات کاری این کارمند هنوز تعیین نشده است."}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            title="مدیریت خدمات کارمند"
            className="h-10 w-full gap-2 rounded-xl border-border bg-surface text-[13px] font-bold text-text-primary transition-colors hover:border-primary/40 hover:bg-primary-soft hover:text-primary focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
            onClick={onServices}
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" /> خدمات
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            title="برنامهٔ کاری کارمند"
            className="h-10 w-full gap-2 rounded-xl border-border bg-surface text-[13px] font-bold text-text-primary transition-colors hover:border-primary/40 hover:bg-primary-soft hover:text-primary focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
            onClick={onSchedule}
          >
            <CalendarClock className="h-4 w-4" aria-hidden="true" /> برنامهٔ کاری
          </Button>
        </div>
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
  const [servicesEmployee, setServicesEmployee] = useState<EmployeeDto | null>(
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
      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <PageHeader
          title="کارکنان"
          description="برای مدیریت کارکنان، ابتدا باید اطلاعات کسب‌وکار شما دریافت شود."
        />
        {businessError && <AuthError message={businessError} />}
        <div>
          <Button
            variant="secondary"
            size="lg"
            className="h-11 px-5 font-bold"
            onClick={() => void fetchMine()}
          >
            تلاش دوباره
          </Button>
        </div>
      </main>
    );
  if (businessStatus === "notFound" || !business)
    return (
      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <PageHeader
          title="کارکنان"
          description="مدیریت کارکنان و برنامهٔ کاری آن‌ها."
        />
        <div className="mx-auto mt-8 flex w-full max-w-xl flex-col items-center gap-4 rounded-2xl border border-dashed border-border-strong bg-surface px-6 py-12 text-center sm:py-14">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Store className="h-5 w-5" aria-hidden="true" />
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
  const employeeGridClass = cn(
    "grid grid-cols-1 gap-4 min-[920px]:grid-cols-2",
    employees.length > 2 && "xl:grid-cols-3",
  );

  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-4 pt-6 pb-14 sm:px-6 sm:pb-16 md:pt-8 lg:px-8">
      <nav
        aria-label="مسیر صفحه"
        className="hidden items-center gap-1.5 text-[13px] font-bold text-muted md:flex"
      >
        <span>داشبورد</span>
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="text-text-secondary">کارکنان</span>
      </nav>
      <PageHeader
        className="mt-4 md:mt-5"
        title="کارکنان"
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary-soft px-2.5 py-1 text-[12px] font-bold text-primary">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            {staffCount} کارمند
          </span>
        }
        description="کارکنان مجموعه و برنامهٔ کاری هفتگی هرکدام را در یک‌جا مدیریت کنید."
        actions={
          <Button
            size="lg"
            className="h-11 gap-1.5 px-5 font-bold"
            onClick={() => setAddOpen(true)}
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            افزودن کارمند
          </Button>
        }
      />
      <div className="mt-5 flex flex-col gap-3">
        {notice && (
          <div
            role="status"
            className="flex items-center gap-2.5 rounded-xl border border-success-border bg-success-soft px-4 py-3 text-[13px] font-bold text-success-text"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            {notice}
          </div>
        )}
        {error && !addOpen && <AuthError message={error} />}
      </div>
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mt-6 w-full sm:mt-7"
      >
        {initialLoading ? (
          <ul
            className="grid grid-cols-1 gap-4 min-[920px]:grid-cols-2 xl:grid-cols-3"
            aria-busy="true"
          >
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <EmployeeCardSkeleton key={item} />
            ))}
          </ul>
        ) : status === "error" && employees.length === 0 ? (
          <div className="rounded-2xl border border-error-border bg-error-soft p-6">
            <AuthError message={error ?? "دریافت فهرست کارکنان ممکن نشد."} />
            <Button
              variant="secondary"
              size="lg"
              className="mt-4 h-11 px-5 font-bold"
              onClick={() => void fetchEmployees(business.id)}
            >
              تلاش دوباره
            </Button>
          </div>
        ) : employees.length === 0 ? (
          <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 rounded-2xl border border-dashed border-border-strong bg-surface px-6 py-12 text-center sm:py-14">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Users className="h-5 w-5" aria-hidden="true" />
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
              className="h-11 gap-1.5 px-6 font-bold"
              onClick={() => setAddOpen(true)}
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              افزودن کارمند
            </Button>
          </div>
        ) : (
          <ul className={employeeGridClass}>
            {employees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                hours={hoursByEmployee[employee.id] ?? []}
                isCurrentUser={profile?.id === employee.userId}
                removing={removingId === employee.id}
                onSchedule={() => setScheduleEmployee(employee)}
                onRemove={() => setConfirmEmployee(employee)}
                onServices={() => setServicesEmployee(employee)}
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
      <EmployeeServicesDrawer
        open={servicesEmployee !== null}
        onOpenChange={(next) => {
          if (!next) setServicesEmployee(null);
        }}
        employee={servicesEmployee}
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
