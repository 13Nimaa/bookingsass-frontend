"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CalendarClock,
  Check,
  Loader2,
  Phone,
  Store,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useBusinessStore } from "@/features/business/store/business-store";
import { useEmployeeStore } from "@/features/employee/store/employee-store";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { AuthError } from "@/components/shared/auth-error";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddEmployeeDialog } from "@/features/employee/components/add-employee-dialog";
import { WeeklyScheduleDialog } from "@/features/employee/components/weekly-schedule-dialog";
import type { EmployeeDto } from "@/features/employee/types";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const, delay: i * 0.06 },
  }),
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "؟";
  return parts.map((p) => p[0]).join("");
}

function LoadingState() {
  return (
    <main
      className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-10 sm:py-10"
      aria-busy="true"
    >
      <div className="h-9 w-28 animate-pulse rounded-full bg-surface-secondary motion-reduce:animate-none" />
      <div className="skeleton-shimmer h-10 w-56 rounded-xl bg-surface-secondary" />
      <div className="skeleton-shimmer h-4 w-full max-w-md rounded bg-surface-secondary" />
      <div className="mt-4 flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton-shimmer h-[76px] rounded-2xl bg-surface" />
        ))}
      </div>
    </main>
  );
}

interface EmployeeRowProps {
  employee: EmployeeDto;
  removing: boolean;
  onSchedule: () => void;
  onRemove: () => void;
}

function EmployeeRow({ employee, removing, onSchedule, onRemove }: EmployeeRowProps) {
  return (
    <li className="group flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition-all duration-200 hover:border-border-strong hover:shadow-[0_16px_32px_-22px_rgba(79,70,229,0.35)] sm:p-5">
      <span
        aria-hidden="true"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-[15px] font-extrabold text-primary ring-1 ring-primary-subtle ring-inset"
      >
        {initialsOf(employee.fullName)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold text-[#1e1b4b]">
          {employee.fullName}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[13px] font-semibold text-slate-500">
          <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span dir="ltr" className="tnum">
            {employee.phoneNumber}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="h-9 gap-1.5 px-3 text-[13px] font-bold"
          onClick={onSchedule}
        >
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          برنامهٔ کاری
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`حذف ${employee.fullName}`}
          title="حذف کارمند"
          className="h-9 w-9 text-slate-400 hover:text-error"
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
  const fetchEmployees = useEmployeeStore((s) => s.fetchEmployees);
  const removeEmployee = useEmployeeStore((s) => s.removeEmployee);
  const clearNotice = useEmployeeStore((s) => s.clearNotice);
  const reset = useEmployeeStore((s) => s.reset);

  const [addOpen, setAddOpen] = useState(false);
  const [scheduleEmployee, setScheduleEmployee] = useState<EmployeeDto | null>(null);
  const [confirmEmployee, setConfirmEmployee] = useState<EmployeeDto | null>(null);

  const businessId = business?.id;

  useEffect(() => {
    void fetchMine();
  }, [fetchMine]);

  useEffect(() => {
    if (businessId) void fetchEmployees(businessId);
  }, [businessId, fetchEmployees]);

  // Drop the employee slice when leaving the page.
  useEffect(() => () => reset(), [reset]);

  // Auto-dismiss success notifications.
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => clearNotice(), 4000);
    return () => clearTimeout(timer);
  }, [notice, clearNotice]);

  if (businessStatus === "idle" || businessStatus === "loading") {
    return <LoadingState />;
  }

  if (businessStatus === "error") {
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-10 sm:py-10">
        <PageHeader
          eyebrow="تیم"
          title="کارمندان"
          description="برای مدیریت کارمندان، ابتدا باید اطلاعات کسب‌وکار شما دریافت شود."
        />
        {businessError && <AuthError message={businessError} />}
        <div>
          <Button variant="secondary" size="lg" onClick={() => void fetchMine()}>
            تلاش دوباره
          </Button>
        </div>
      </main>
    );
  }

  if (businessStatus === "notFound" || !business) {
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-10 sm:py-10">
        <PageHeader
          eyebrow="تیم"
          title="کارمندان"
          description="مدیریت کارمندان و برنامهٔ کاری آن‌ها."
        />
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-8 flex flex-col items-center gap-4 rounded-[1.75rem] border border-dashed border-border-strong bg-surface-subtle px-6 py-14 text-center"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Store className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-[17px] font-extrabold text-[#1e1b4b]">
              ابتدا کسب‌وکار خود را ثبت کنید
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 font-medium text-slate-600">
              برای افزودن کارمند و تعیین برنامهٔ کاری، ابتدا باید اطلاعات کسب‌وکار شما
              تکمیل شده باشد.
            </p>
          </div>
          <Button
            size="lg"
            className="h-11 px-6 font-bold"
            onClick={() => router.push("/dashboard/business")}
          >
            ثبت کسب‌وکار
          </Button>
        </motion.div>
      </main>
    );
  }

  const isInitialLoading =
    (status === "idle" || status === "loading") && employees.length === 0;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-10 sm:py-10">
      <PageHeader
        eyebrow="تیم"
        title="کارمندان"
        description="کارمندان مجموعه را با شمارهٔ موبایل اضافه کنید و برنامهٔ کاری هفتگی هرکدام را مدیریت کنید."
        actions={
          <Button
            size="lg"
            className="h-11 px-5 font-bold"
            onClick={() => setAddOpen(true)}
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
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
            <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
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
        {isInitialLoading ? (
          <ul className="flex flex-col gap-3" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <li key={i} className="skeleton-shimmer h-[76px] rounded-2xl bg-surface" />
            ))}
          </ul>
        ) : status === "error" ? (
          <div className="flex flex-col gap-4 rounded-[1.75rem] border border-border bg-surface p-6 sm:p-8">
            <p className="text-sm leading-6 font-semibold text-slate-600">
              دریافت فهرست کارمندان ممکن نشد.
            </p>
            <div>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => businessId && void fetchEmployees(businessId)}
              >
                تلاش دوباره
              </Button>
            </div>
          </div>
        ) : employees.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-[1.75rem] border border-dashed border-border-strong bg-surface-subtle px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Users className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-[17px] font-extrabold text-[#1e1b4b]">
                هنوز کارمندی اضافه نشده است
              </h2>
              <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 font-medium text-slate-600">
                کارمندان خود را با شمارهٔ موبایل اضافه کنید تا بتوانید برنامهٔ کاری آن‌ها
                را مدیریت کنید. هر کارمند باید از قبل در BookFlow ثبت‌نام کرده باشد.
              </p>
            </div>
            <Button
              size="lg"
              className="h-11 px-6 font-bold"
              onClick={() => setAddOpen(true)}
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              افزودن کارمند
            </Button>
          </div>
        ) : (
          <>
            <p className="mb-3 text-[13px] font-bold text-slate-500">
              {employees.length.toLocaleString("fa-IR")} کارمند
            </p>
            <ul className="flex flex-col gap-3">
              {employees.map((employee) => (
                <EmployeeRow
                  key={employee.id}
                  employee={employee}
                  removing={removingId === employee.id}
                  onSchedule={() => setScheduleEmployee(employee)}
                  onRemove={() => setConfirmEmployee(employee)}
                />
              ))}
            </ul>
          </>
        )}
      </motion.div>

      {businessId && (
        <>
          <AddEmployeeDialog
            open={addOpen}
            onOpenChange={setAddOpen}
            businessId={businessId}
          />
          <WeeklyScheduleDialog
            open={scheduleEmployee !== null}
            onOpenChange={(open) => {
              if (!open) setScheduleEmployee(null);
            }}
            businessId={businessId}
            employee={scheduleEmployee}
          />
          <ConfirmDialog
            open={confirmEmployee !== null}
            onOpenChange={(open) => {
              if (!open) setConfirmEmployee(null);
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
              if (!confirmEmployee) return;
              const ok = await removeEmployee(businessId, confirmEmployee.id);
              if (ok) setConfirmEmployee(null);
            }}
          />
        </>
      )}

      {/* Accessible live region announcing mutations to screen readers. */}
      <span className="sr-only" role="status" aria-live="polite">
        {notice ?? ""}
      </span>
    </main>
  );
}
