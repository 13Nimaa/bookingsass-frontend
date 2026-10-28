"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AuthError } from "@/components/shared/auth-error";
import { useEmployeeStore } from "@/features/employee/store/employee-store";
import {
  DAY_LABELS,
  WEEK_ORDER,
  toTimeInput,
  toTimePayload,
} from "@/features/employee/lib/schedule";
import type { EmployeeDto } from "@/features/employee/types";

interface WeeklyScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: number;
  employee: EmployeeDto | null;
}

const timeFieldClass =
  "h-12 w-full rounded-xl border border-border bg-surface px-3 text-[15px] font-semibold text-[#1e1b4b] outline-none transition-all duration-200 hover:border-border-strong focus:border-primary focus:ring-4 focus:ring-primary-soft disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:opacity-60";

export function WeeklyScheduleDialog({
  open,
  onOpenChange,
  businessId,
  employee,
}: WeeklyScheduleDialogProps) {
  const hoursMap = useEmployeeStore((s) => s.workingHoursByEmployee);
  const scheduleStatus = useEmployeeStore((s) => s.scheduleStatus);
  const scheduleError = useEmployeeStore((s) => s.scheduleError);
  const scheduleSaving = useEmployeeStore((s) => s.scheduleSaving);
  const loadSchedule = useEmployeeStore((s) => s.loadSchedule);
  const addWorkingHour = useEmployeeStore((s) => s.addWorkingHour);
  const removeWorkingHour = useEmployeeStore((s) => s.removeWorkingHour);

  const [day, setDay] = useState<number>(6);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [localError, setLocalError] = useState<string | null>(null);

  const employeeId = employee?.id ?? null;
  const hours = employeeId ? hoursMap[employeeId] ?? [] : [];

  useEffect(() => {
    if (open && employee && businessId) {
      void loadSchedule(businessId, employee.id);
    }
  }, [open, employee, businessId, loadSchedule]);

  const handleAdd = async () => {
    if (!employee) return;
    if (!start || !end) {
      setLocalError("ساعت شروع و پایان را وارد کنید.");
      return;
    }
    if (end <= start) {
      setLocalError("ساعت پایان باید بعد از ساعت شروع باشد.");
      return;
    }
    setLocalError(null);
    await addWorkingHour(businessId, employee.id, {
      dayOfWeek: day,
      startTime: toTimePayload(start),
      endTime: toTimePayload(end),
    });
  };

  const errorMessage = localError ?? scheduleError;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setLocalError(null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>برنامهٔ کاری هفتگی</DialogTitle>
          <DialogDescription>
            {employee
              ? `ساعات کاری ${employee.fullName} را برای هر روز هفته تعیین کنید. بازه‌ها نباید با هم تداخل داشته باشند.`
              : ""}
          </DialogDescription>
        </DialogHeader>

        {/* Add-shift composer */}
        <div className="mt-5 rounded-2xl border border-border-subtle bg-surface-subtle p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-end">
            <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
              <label
                htmlFor="schedule-day"
                className="text-[13px] font-bold text-[#1e1b4b]"
              >
                روز هفته
              </label>
              <select
                id="schedule-day"
                value={day}
                onChange={(e) => {
                  setDay(Number(e.target.value));
                  setLocalError(null);
                }}
                className={timeFieldClass}
                disabled={scheduleSaving}
              >
                {WEEK_ORDER.map((d) => (
                  <option key={d} value={d}>
                    {DAY_LABELS[d]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="schedule-start"
                className="text-[13px] font-bold text-[#1e1b4b]"
              >
                از ساعت
              </label>
              <input
                id="schedule-start"
                type="time"
                dir="ltr"
                value={start}
                onChange={(e) => {
                  setStart(e.target.value);
                  setLocalError(null);
                }}
                className={timeFieldClass}
                disabled={scheduleSaving}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="schedule-end"
                className="text-[13px] font-bold text-[#1e1b4b]"
              >
                تا ساعت
              </label>
              <input
                id="schedule-end"
                type="time"
                dir="ltr"
                value={end}
                onChange={(e) => {
                  setEnd(e.target.value);
                  setLocalError(null);
                }}
                className={timeFieldClass}
                disabled={scheduleSaving}
              />
            </div>

            <Button
              type="button"
              size="lg"
              className="col-span-2 h-12 px-5 font-bold sm:col-span-1"
              onClick={() => void handleAdd()}
              disabled={scheduleSaving}
            >
              {scheduleSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Plus className="h-4 w-4" aria-hidden="true" />
              )}
              افزودن
            </Button>
          </div>

          {errorMessage && (
            <div className="mt-4">
              <AuthError message={errorMessage} />
            </div>
          )}
        </div>

        {/* Weekly overview */}
        <div className="mt-5">
          {scheduleStatus === "loading" && hours.length === 0 ? (
            <ul className="flex flex-col gap-2" aria-busy="true">
              {WEEK_ORDER.map((d) => (
                <li
                  key={d}
                  className="skeleton-shimmer h-12 rounded-xl bg-surface-secondary"
                />
              ))}
            </ul>
          ) : (
            <ul className="flex flex-col divide-y divide-border-subtle border-y border-border-subtle">
              {WEEK_ORDER.map((d) => {
                const dayHours = hours.filter((h) => h.dayOfWeek === d);
                const hasShifts = dayHours.length > 0;
                return (
                  <li
                    key={d}
                    className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <div className="flex items-center gap-2.5 sm:w-32 sm:shrink-0">
                      <span
                        aria-hidden="true"
                        className={`h-2 w-2 rounded-full ${
                          hasShifts ? "bg-primary" : "bg-border-strong"
                        }`}
                      />
                      <span className="text-sm font-bold text-[#1e1b4b]">
                        {DAY_LABELS[d]}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 ps-4 sm:ps-0">
                      {!hasShifts ? (
                        <span className="text-[13px] font-medium text-slate-400">
                          بدون ساعت کاری
                        </span>
                      ) : (
                        dayHours.map((h) => (
                          <span
                            key={h.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-subtle py-1 pe-1.5 ps-2.5 text-[13px] font-semibold text-[#1e1b4b]"
                          >
                            <span dir="ltr" className="tnum">
                              {toTimeInput(h.startTime)} – {toTimeInput(h.endTime)}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                void removeWorkingHour(businessId, h.employeeId, h.id)
                              }
                              disabled={scheduleSaving}
                              aria-label={`حذف بازه ${toTimeInput(h.startTime)} تا ${toTimeInput(h.endTime)} ${DAY_LABELS[d]}`}
                              className="flex h-5 w-5 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-error-soft hover:text-error focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-error disabled:opacity-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="h-11 px-5"
            onClick={() => onOpenChange(false)}
          >
            بستن
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
