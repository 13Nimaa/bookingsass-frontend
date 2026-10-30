"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Loader2, Plus, Trash2, Undo2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select";
import { AuthError } from "@/components/shared/auth-error";
import { JalaliDatePicker } from "@/features/employee/components/jalali-date-picker";
import { useEmployeeStore } from "@/features/employee/store/employee-store";
import {
  formatJalaliDate,
  jalaliToGregorianIso,
  shiftGregorianIsoDate,
  todayJalali,
  type JalaliDate,
} from "@/features/employee/lib/jalali-date";
import { toTimeInput, toTimePayload } from "@/features/employee/lib/schedule";
import type { EmployeeDto, WorkingHourDto } from "@/features/employee/types";

interface WeeklyScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: number;
  employee: EmployeeDto | null;
}

const TIME_OPTIONS = Array.from(
  { length: 48 },
  (_, index) =>
    `${String(Math.floor(index / 2)).padStart(2, "0")}:${index % 2 === 0 ? "00" : "30"}`,
);

function overlaps(start: string, end: string, intervals: WorkingHourDto[]) {
  return intervals.some(
    (item) =>
      start < toTimeInput(item.endTime) && end > toTimeInput(item.startTime),
  );
}

export function WeeklyScheduleDialog({
  open,
  onOpenChange,
  businessId,
  employee,
}: WeeklyScheduleDialogProps) {
  const hoursMap = useEmployeeStore((state) => state.workingHoursByEmployee);
  const scheduleStatus = useEmployeeStore((state) => state.scheduleStatus);
  const scheduleError = useEmployeeStore((state) => state.scheduleError);
  const scheduleSaving = useEmployeeStore((state) => state.scheduleSaving);
  const loadSchedule = useEmployeeStore((state) => state.loadSchedule);
  const addWorkingHour = useEmployeeStore((state) => state.addWorkingHour);
  const removeWorkingHour = useEmployeeStore(
    (state) => state.removeWorkingHour,
  );
  const [selectedJalaliDate, setSelectedJalaliDate] =
    useState<JalaliDate>(todayJalali);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [localError, setLocalError] = useState<string | null>(null);
  const [undoItem, setUndoItem] = useState<WorkingHourDto | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const employeeId = employee?.id ?? null;
  const hours = useMemo(
    () => (employeeId ? (hoursMap[employeeId] ?? []) : []),
    [employeeId, hoursMap],
  );
  const selectedDate = useMemo(
    () => jalaliToGregorianIso(selectedJalaliDate),
    [selectedJalaliDate],
  );
  const selectedHours = useMemo(
    () => hours.filter((item) => item.date === selectedDate),
    [hours, selectedDate],
  );
  const isInvalid =
    !start || !end || end <= start || overlaps(start, end, selectedHours);
  const isBusy = scheduleSaving || isCopying;

  useEffect(() => {
    if (open && employee && businessId)
      void loadSchedule(businessId, employee.id);
  }, [open, employee, businessId, loadSchedule]);
  useEffect(() => {
    if (!undoItem) return;
    const timer = window.setTimeout(() => setUndoItem(null), 5500);
    return () => window.clearTimeout(timer);
  }, [undoItem]);

  const validate = () => {
    if (end <= start) {
      setLocalError("ساعت پایان باید بعد از ساعت شروع باشد.");
      return false;
    }
    if (overlaps(start, end, selectedHours)) {
      setLocalError("این بازه با یکی از ساعت‌های همین تاریخ تداخل دارد.");
      return false;
    }
    setLocalError(null);
    return true;
  };

  const addInterval = async () => {
    if (!employee || !validate()) return;
    await addWorkingHour(businessId, employee.id, {
      date: selectedDate,
      startTime: toTimePayload(start),
      endTime: toTimePayload(end),
    });
  };

  const copyFromPreviousDate = async () => {
    if (!employee) return;
    const previousHours = hours.filter(
      (item) => item.date === shiftGregorianIsoDate(selectedDate, -1),
    );
    if (!previousHours.length) {
      setLocalError("برای تاریخ قبل بازه‌ای ثبت نشده است.");
      return;
    }
    const targets = previousHours.filter(
      (item) =>
        !overlaps(
          toTimeInput(item.startTime),
          toTimeInput(item.endTime),
          selectedHours,
        ),
    );
    setIsCopying(true);
    try {
      for (const item of targets) {
        await addWorkingHour(businessId, employee.id, {
          date: selectedDate,
          startTime: item.startTime,
          endTime: item.endTime,
        });
      }
    } finally {
      setIsCopying(false);
    }
    setLocalError(targets.length ? null : "بازهٔ تازه‌ای برای کپی وجود ندارد.");
  };

  const copyToFollowingWeek = async () => {
    if (!employee || !selectedHours.length) {
      setLocalError("ابتدا برای این تاریخ یک بازه ثبت کنید.");
      return;
    }
    setIsCopying(true);
    try {
      for (let offset = 1; offset <= 6; offset += 1) {
        const targetDate = shiftGregorianIsoDate(selectedDate, offset);
        const targetHours = hours.filter((item) => item.date === targetDate);
        for (const item of selectedHours) {
          if (
            !overlaps(
              toTimeInput(item.startTime),
              toTimeInput(item.endTime),
              targetHours,
            )
          ) {
            await addWorkingHour(businessId, employee.id, {
              date: targetDate,
              startTime: item.startTime,
              endTime: item.endTime,
            });
          }
        }
      }
    } finally {
      setIsCopying(false);
    }
    setLocalError(null);
  };

  const removeInterval = async (item: WorkingHourDto) => {
    if (await removeWorkingHour(businessId, item.employeeId, item.id))
      setUndoItem(item);
  };

  const undoRemoval = async () => {
    if (!undoItem || !employee) return;
    const item = undoItem;
    setUndoItem(null);
    if (!item.date) {
      setLocalError("بازهٔ قدیمی بدون تاریخ قابل بازگردانی نیست.");
      return;
    }
    await addWorkingHour(businessId, employee.id, {
      date: item.date,
      startTime: item.startTime,
      endTime: item.endTime,
    });
  };

  const errorMessage = localError ?? scheduleError;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] max-w-2xl flex-col overflow-hidden p-0 sm:max-h-[min(48rem,calc(100dvh-4rem))]">
        <DialogHeader className="shrink-0 border-b border-border-subtle px-6 pb-4 pt-6 sm:px-7">
          <DialogTitle>برنامهٔ کاری</DialogTitle>
          <DialogDescription>
            {employee
              ? `ساعت‌های کاری ${employee.fullName} را برای هر تاریخ تنظیم کنید.`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5 sm:px-7">
          <div className="rounded-2xl border border-border-subtle bg-surface-subtle p-4 sm:p-5">
            <label className="flex max-w-sm flex-col gap-1.5 text-[13px] font-bold text-text-primary">
              تاریخ کاری
              <JalaliDatePicker
                value={selectedJalaliDate}
                onChange={(date) => {
                  setSelectedJalaliDate(date);
                  setLocalError(null);
                }}
                disabled={isBusy}
              />
            </label>
           
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <SelectField
                label="از ساعت"
                options={TIME_OPTIONS}
                value={start}
                onValueChange={(next) => {
                  setStart(next);
                  setLocalError(null);
                }}
                dir="ltr"
                disabled={isBusy}
              />
              <SelectField
                label="تا ساعت"
                options={TIME_OPTIONS}
                value={end}
                onValueChange={(next) => {
                  setEnd(next);
                  setLocalError(null);
                }}
                dir="ltr"
                disabled={isBusy}
              />
              <Button
                type="button"
                size="lg"
                className="h-12 px-5 font-bold"
                onClick={() => void addInterval()}
                disabled={isBusy || isInvalid}
              >
                {isBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                افزودن بازه
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setStart("09:00");
                  setEnd("17:00");
                  setLocalError(null);
                }}
                disabled={isBusy}
              >
                ۰۹–۱۷
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setStart("10:00");
                  setEnd("19:00");
                  setLocalError(null);
                }}
                disabled={isBusy}
              >
                ۱۰–۱۹
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void copyFromPreviousDate()}
                disabled={isBusy}
              >
                کپی تاریخ قبل
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void copyToFollowingWeek()}
                disabled={isBusy}
              >
                <Copy className="h-3.5 w-3.5" /> کپی برای ۶ روز آینده
              </Button>
            </div>
            {errorMessage && (
              <div className="mt-4">
                <AuthError message={errorMessage} />
              </div>
            )}
          </div>
          <div className="mt-5">
            {scheduleStatus === "loading" && hours.length === 0 ? (
              <div
                className="skeleton-shimmer h-24 rounded-2xl bg-surface-secondary"
                aria-busy="true"
              />
            ) : (
              <section
                aria-label={`ساعت‌های ${formatJalaliDate(selectedJalaliDate)}`}
                className="rounded-2xl border border-border-subtle bg-surface p-4"
              >
                <div className="flex items-center justify-between gap-3 border-b border-border-subtle pb-3">
                  <h3 className="text-sm font-extrabold text-text-primary">
                    {formatJalaliDate(selectedJalaliDate, {
                      includeWeekday: true,
                    })}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-bold ${selectedHours.length ? "bg-success-soft text-success-text" : "bg-surface-secondary text-muted"}`}
                  >
                    {selectedHours.length ? "فعال" : "تعطیل"}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {!selectedHours.length ? (
                    <span className="text-[13px] font-bold text-muted">
                      برای این تاریخ بازهٔ کاری ثبت نشده است.
                    </span>
                  ) : (
                    selectedHours.map((hour) => (
                      <span
                        key={hour.id}
                        className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-border bg-surface px-2.5 text-[13px] font-bold text-text-primary"
                      >
                        <span dir="ltr" className="tnum">
                          {toTimeInput(hour.startTime)} –{" "}
                          {toTimeInput(hour.endTime)}
                        </span>
                        <button
                          type="button"
                          onClick={() => void removeInterval(hour)}
                          disabled={isBusy}
                          aria-label={`حذف بازه ${toTimeInput(hour.startTime)} تا ${toTimeInput(hour.endTime)} در ${formatJalaliDate(selectedJalaliDate)}`}
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-error-soft hover:text-error focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-error disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </section>
            )}
          </div>
          <p
            className="mt-4 flex items-center gap-2 text-xs font-bold text-muted"
            role="status"
          >
            {isBusy ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> در حال ذخیره…
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5 text-success" /> تغییرات ذخیره
                شده‌اند
              </>
            )}
          </p>
        </div>
        <DialogFooter className="mt-0 shrink-0 border-t border-border-subtle px-6 py-4 sm:px-7">
          <Button
            type="button"
            size="lg"
            className="h-11 w-full px-5 font-bold sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            بستن
          </Button>
        </DialogFooter>
      </DialogContent>
      {undoItem && (
        <div
          role="status"
          className="fixed inset-x-4 bottom-20 z-[60] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-bold text-text-primary shadow-[0_20px_40px_-24px_rgba(30,27,75,0.45)] md:inset-x-auto md:end-6 md:bottom-6"
        >
          <span className="flex-1">بازه حذف شد.</span>
          <button
            type="button"
            onClick={() => void undoRemoval()}
            className="inline-flex min-h-10 items-center gap-1 rounded-xl px-2 text-primary hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-primary"
          >
            <Undo2 className="h-4 w-4" /> بازگردانی
          </button>
        </div>
      )}
    </Dialog>
  );
}
