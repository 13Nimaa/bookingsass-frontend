"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import {
  addJalaliMonths,
  compareJalali,
  formatJalaliDate,
  jalaliMonthLength,
  jalaliToGregorianIso,
  JALALI_MONTH_NAMES,
  JALALI_WEEKDAY_LABELS,
  todayJalali,
  type JalaliDate,
} from "@/features/employee/lib/jalali-date";

interface JalaliDatePickerProps {
  value: JalaliDate;
  onChange: (value: JalaliDate) => void;
  disabled?: boolean;
  /** Dates strictly before this day cannot be selected. */
  minDate?: JalaliDate;
}

function sameDate(first: JalaliDate, second: JalaliDate) {
  return first.year === second.year && first.month === second.month && first.day === second.day;
}

function monthStartOffset(year: number, month: number) {
  const [gregorianYear, gregorianMonth, gregorianDay] = jalaliToGregorianIso({ year, month, day: 1 }).split("-").map(Number);
  return (new Date(gregorianYear, gregorianMonth - 1, gregorianDay).getDay() + 1) % 7;
}

export function JalaliDatePicker({
  value,
  onChange,
  disabled = false,
  minDate,
}: JalaliDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState({ year: value.year, month: value.month });
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const today = todayJalali();
  const days = useMemo(() => {
    const firstOffset = monthStartOffset(view.year, view.month);
    const length = jalaliMonthLength(view.year, view.month);
    return Array.from({ length: 42 }, (_, index) => {
      const day = index - firstOffset + 1;
      return day >= 1 && day <= length ? { year: view.year, month: view.month, day } : null;
    });
  }, [view]);

  useEffect(() => {
    if (!open) return;
    const closeWhenOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeWhenOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeWhenOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => {
          if (!open) setView({ year: value.year, month: value.month });
          setOpen((current) => !current);
        }}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}
        className="flex h-12 w-full items-center justify-between rounded-xl border border-border bg-surface px-3 text-right text-[15px] font-bold text-text-primary outline-none transition-all hover:border-border-strong focus:border-primary focus:ring-4 focus:ring-primary-soft disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:opacity-60"
      >
        <span>{formatJalaliDate(value, { includeWeekday: true })}</span>
        <CalendarDays className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      </button>
      {open && (
        <div id={panelId} role="dialog" aria-label="انتخاب تاریخ جلالی" className="absolute z-20 mt-2 w-[min(21rem,calc(100vw-4rem))] rounded-2xl border border-border bg-surface p-3 shadow-[0_20px_45px_-24px_rgba(30,27,75,0.45)]">
          <div className="mb-3 flex items-center justify-between gap-2">
            <button type="button" aria-label="ماه بعد" onClick={() => setView((current) => addJalaliMonths({ ...current, day: 1 }, 1))} className="flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-primary-soft hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"><ChevronRight className="h-4 w-4" /></button>
            <p className="text-sm font-extrabold text-text-primary">{JALALI_MONTH_NAMES[view.month - 1]} {view.year.toLocaleString("fa-IR")}</p>
            <button type="button" aria-label="ماه قبل" onClick={() => setView((current) => addJalaliMonths({ ...current, day: 1 }, -1))} className="flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-primary-soft hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"><ChevronLeft className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center" dir="rtl">
            {JALALI_WEEKDAY_LABELS.map((label) => <span key={label} className="flex h-9 items-center justify-center text-xs font-extrabold text-muted">{label}</span>)}
            {days.map((date, index) => {
              if (!date) {
                return <span key={`empty-${index}`} aria-hidden="true" className="h-9" />;
              }
              const beforeMin = minDate ? compareJalali(date, minDate) < 0 : false;
              return (
                <button
                  key={jalaliToGregorianIso(date)}
                  type="button"
                  disabled={beforeMin}
                  onClick={() => {
                    if (beforeMin) return;
                    onChange(date);
                    setOpen(false);
                  }}
                  aria-pressed={sameDate(date, value)}
                  aria-label={formatJalaliDate(date, { includeWeekday: true })}
                  className={`flex h-9 items-center justify-center rounded-lg text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent ${
                    sameDate(date, value)
                      ? "bg-primary text-primary-foreground"
                      : sameDate(date, today)
                        ? "bg-primary-soft text-text-secondary ring-1 ring-primary-subtle ring-inset hover:bg-primary-subtle"
                        : "text-text-primary hover:bg-surface-secondary"
                  }`}
                >
                  {date.day.toLocaleString("fa-IR")}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            disabled={minDate ? compareJalali(today, minDate) < 0 : false}
            onClick={() => {
              if (minDate && compareJalali(today, minDate) < 0) return;
              onChange(today);
              setOpen(false);
            }}
            className="mt-3 min-h-10 w-full rounded-xl bg-primary-soft px-3 text-sm font-bold text-text-secondary transition-colors hover:bg-primary-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            امروز
          </button>
        </div>
      )}
    </div>
  );
}
