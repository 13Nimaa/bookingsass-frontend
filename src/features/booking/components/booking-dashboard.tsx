"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  CalendarDays,
  CalendarX2,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { cn } from "cn";
import { PageHeader } from "@/components/shared/page-header";
import { AuthError } from "@/components/shared/auth-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JalaliDatePicker } from "@/features/employee/components/jalali-date-picker";
import {
  formatJalaliDate,
  jalaliToGregorianIso,
  todayJalali,
  type JalaliDate,
} from "@/features/employee/lib/jalali-date";
import { BookingStatus, type ListBookingsParams } from "@/features/booking/types";
import { dayEndUtcIso, dayStartUtcIso } from "@/features/booking/lib/format";
import { BOOKING_STATUS_OPTIONS } from "@/features/booking/lib/status";
import { useBookingStore } from "@/features/booking/store/booking-store";
import {
  BookingCard,
  BookingCardSkeleton,
} from "@/features/booking/components/booking-card";

const PAGE_SIZE = 20;

type StatusFilter = "all" | BookingStatus;

function BookingsBreadcrumb() {
  return (
    <nav aria-label="مسیر صفحه" className="mb-4 hidden md:block">
      <ol className="flex flex-wrap items-center gap-1.5 text-[13px] font-semibold text-slate-500">
        <li>
          <Link
            href="/dashboard"
            className="transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            داشبورد
          </Link>
        </li>
        <li aria-hidden="true" className="text-slate-400">
          <ChevronLeft className="h-3.5 w-3.5" />
        </li>
        <li className="font-bold text-text-primary" aria-current="page">
          رزروها
        </li>
      </ol>
    </nav>
  );
}

function DateRangeFilter({
  from,
  to,
  onChange,
  onClear,
}: {
  from: JalaliDate | null;
  to: JalaliDate | null;
  onChange: (next: { from: JalaliDate | null; to: JalaliDate | null }) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const active = from != null || to != null;
  const draftFrom = from ?? todayJalali();
  const draftTo = to ?? todayJalali();

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

  const label = active
    ? `${from ? formatJalaliDate(from) : "—"} تا ${to ? formatJalaliDate(to) : "—"}`
    : "بازه تاریخ";

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}
        aria-label="فیلتر تاریخ رزرو"
        className={cn(
          "flex h-11 w-full min-w-[10.5rem] items-center justify-between gap-2 rounded-xl border bg-surface px-3 text-right text-[13px] font-bold outline-none transition-all duration-150 motion-reduce:transition-none sm:h-12 sm:text-[14px]",
          active
            ? "border-primary text-primary ring-2 ring-primary-soft"
            : "border-border text-text-primary hover:border-border-strong",
          "focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary-soft",
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <CalendarDays
            className="h-4 w-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span className="truncate">{label}</span>
        </span>
        {active ? (
          <span
            role="button"
            tabIndex={0}
            aria-label="حذف بازه تاریخ"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-secondary hover:text-text-primary"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onClear();
              }
            }}
          >
            <X className="h-3.5 w-3.5" />
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="انتخاب بازه تاریخ رزرو"
          className="absolute end-0 z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-border bg-surface p-3 shadow-[0_20px_45px_-24px_rgba(30,27,75,0.45)] sm:p-4"
        >
          <div className="space-y-3">
            <div className="space-y-1.5">
              <p className="text-[12px] font-bold text-slate-600">از تاریخ</p>
              <JalaliDatePicker
                value={draftFrom}
                onChange={(date) => onChange({ from: date, to })}
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-[12px] font-bold text-slate-600">تا تاریخ</p>
              <JalaliDatePicker
                value={draftTo}
                onChange={(date) => onChange({ from, to: date })}
              />
            </div>
            <div className="flex items-center justify-between gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 px-3 text-[13px]"
                onClick={() => {
                  onClear();
                  setOpen(false);
                }}
              >
                پاک کردن
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-9 px-4 text-[13px] font-bold"
                onClick={() => {
                  if (!from && !to) onChange({ from: draftFrom, to: draftTo });
                  setOpen(false);
                }}
              >
                اعمال
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ListPagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const safeTotalPages = Math.max(1, totalPages || 1);
  const rangeStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalCount);

  const pages = useMemo(() => {
    const maxButtons = 5;
    if (safeTotalPages <= maxButtons) {
      return Array.from({ length: safeTotalPages }, (_, i) => i + 1);
    }
    const start = Math.max(
      1,
      Math.min(page - 2, safeTotalPages - maxButtons + 1),
    );
    return Array.from({ length: maxButtons }, (_, i) => start + i);
  }, [page, safeTotalPages]);

  if (totalCount === 0) return null;

  return (
    <div className="flex flex-col gap-3 border-t border-border-subtle pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[13px] font-medium text-muted tnum">
        نمایش {rangeStart.toLocaleString("fa-IR")} تا{" "}
        {rangeEnd.toLocaleString("fa-IR")} از{" "}
        {totalCount.toLocaleString("fa-IR")} رزرو
      </p>
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 gap-1 px-3"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="صفحه قبل"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">قبلی</span>
        </Button>
        <div className="flex items-center gap-1">
          {pages.map((p) => {
            const active = p === page;
            return (
              <button
                key={p}
                type="button"
                aria-label={`صفحه ${p}`}
                aria-current={active ? "page" : undefined}
                onClick={() => onPageChange(p)}
                className={cn(
                  "flex h-10 min-w-10 items-center justify-center rounded-xl px-2 text-[13px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  active
                    ? "bg-primary-soft text-primary"
                    : "text-muted hover:bg-surface-secondary hover:text-text-primary",
                )}
              >
                <span className="tnum">{p.toLocaleString("fa-IR")}</span>
              </button>
            );
          })}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 gap-1 px-3"
          disabled={page >= safeTotalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="صفحه بعد"
        >
          <span className="hidden sm:inline">بعدی</span>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

function buildListParams(input: {
  search: string;
  status: StatusFilter;
  dateFrom: JalaliDate | null;
  dateTo: JalaliDate | null;
  page: number;
}): ListBookingsParams {
  const params: ListBookingsParams = {
    page: input.page,
    pageSize: PAGE_SIZE,
  };
  const q = input.search.trim();
  if (q) params.search = q;
  if (input.status !== "all") params.status = input.status;

  let fromYmd = input.dateFrom
    ? jalaliToGregorianIso(input.dateFrom)
    : undefined;
  let toYmd = input.dateTo ? jalaliToGregorianIso(input.dateTo) : undefined;
  if (fromYmd && toYmd && fromYmd > toYmd) {
    const swap = fromYmd;
    fromYmd = toYmd;
    toYmd = swap;
  }
  if (fromYmd) params.fromDate = dayStartUtcIso(fromYmd);
  if (toYmd) params.toDate = dayEndUtcIso(toYmd);
  return params;
}

export function BookingDashboard() {
  const bookings = useBookingStore((s) => s.bookings);
  const status = useBookingStore((s) => s.status);
  const error = useBookingStore((s) => s.error);
  const totalCount = useBookingStore((s) => s.totalCount);
  const totalPages = useBookingStore((s) => s.totalPages);
  const pageFromStore = useBookingStore((s) => s.page);
  const fetchBookings = useBookingStore((s) => s.fetchBookings);
  const clearError = useBookingStore((s) => s.clearError);
  const reset = useBookingStore((s) => s.reset);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFrom, setDateFrom] = useState<JalaliDate | null>(null);
  const [dateTo, setDateTo] = useState<JalaliDate | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => () => reset(), [reset]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const listParams = useMemo(
    () =>
      buildListParams({
        search: debouncedSearch,
        status: statusFilter,
        dateFrom,
        dateTo,
        page,
      }),
    [debouncedSearch, statusFilter, dateFrom, dateTo, page],
  );

  useEffect(() => {
    void fetchBookings(listParams);
  }, [listParams, fetchBookings]);

  const filtersActive =
    search.trim().length > 0 ||
    statusFilter !== "all" ||
    dateFrom != null ||
    dateTo != null;

  const currentPage = pageFromStore || page;

  const clearFilters = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setDateFrom(null);
    setDateTo(null);
    setPage(1);
  }, []);

  const isListLoading = status === "idle" || status === "loading";
  const showSkeletons = isListLoading && bookings.length === 0;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-4 py-8 sm:px-10 sm:py-10">
      <BookingsBreadcrumb />
      <PageHeader
        title="مدیریت رزروها"
        badge={
          <CalendarDays
            className="h-5 w-5 text-primary"
            aria-hidden="true"
          />
        }
      />

      <section
        aria-label="فیلتر رزروها"
        className="rounded-2xl border border-border bg-surface p-3 sm:p-4"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در مشتری، سرویس یا کارمند..."
              aria-label="جستجوی رزرو"
              className="h-11 sm:h-12"
              startIcon={<Search className="h-4 w-4" aria-hidden="true" />}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-[11rem_13rem]">
            <Select
              value={statusFilter === "all" ? "all" : String(statusFilter)}
              onValueChange={(value) => {
                if (value == null) return;
                setStatusFilter(
                  value === "all" ? "all" : (Number(value) as BookingStatus),
                );
                setPage(1);
              }}
              items={[
                { value: "all", label: "همه وضعیت‌ها" },
                ...BOOKING_STATUS_OPTIONS.map((option) => ({
                  value: String(option.value),
                  label: option.label,
                })),
              ]}
            >
              <SelectTrigger
                aria-label="فیلتر وضعیت"
                className={cn(
                  "h-11 w-full text-[13px] sm:h-12 sm:text-[14px]",
                  statusFilter !== "all" &&
                    "border-primary ring-2 ring-primary-soft",
                )}
              >
                <SelectValue placeholder="همه وضعیت‌ها" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" label="همه وضعیت‌ها">
                  همه وضعیت‌ها
                </SelectItem>
                {BOOKING_STATUS_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={String(option.value)}
                    label={option.label}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DateRangeFilter
              from={dateFrom}
              to={dateTo}
              onChange={({ from, to }) => {
                setDateFrom(from);
                setDateTo(to);
                setPage(1);
              }}
              onClear={() => {
                setDateFrom(null);
                setDateTo(null);
                setPage(1);
              }}
            />
          </div>
        </div>

        {filtersActive ? (
          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5 px-2.5 text-[13px] text-muted"
              onClick={clearFilters}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              پاک کردن فیلترها
            </Button>
          </div>
        ) : null}
      </section>

      {error && status === "error" ? (
        <div className="space-y-3">
          <AuthError message={error} />
          <Button
            type="button"
            variant="outline"
            className="h-10"
            onClick={() => {
              clearError();
              void fetchBookings(listParams);
            }}
          >
            تلاش دوباره
          </Button>
        </div>
      ) : null}

      {showSkeletons ? (
        <ul className="flex flex-col gap-3" aria-busy="true" aria-label="در حال بارگذاری رزروها">
          {[0, 1, 2, 3, 4].map((i) => (
            <BookingCardSkeleton key={i} />
          ))}
        </ul>
      ) : null}

      {!showSkeletons && status === "loaded" && bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-secondary text-muted">
            <CalendarX2 className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <p className="text-[15px] font-bold text-text-primary">
              رزروی یافت نشد
            </p>
            <p className="max-w-sm text-[13px] font-medium leading-6 text-muted">
              {filtersActive
                ? "هیچ رزروی با فیلترهای فعلی مطابقت ندارد. فیلترها را تغییر دهید یا پاک کنید."
                : "هنوز رزروی برای این سالن ثبت نشده است."}
            </p>
          </div>
          {filtersActive ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-1 h-10"
              onClick={clearFilters}
            >
              پاک کردن فیلترها
            </Button>
          ) : null}
        </div>
      ) : null}

      {!showSkeletons && bookings.length > 0 ? (
        <div className="space-y-4" aria-busy={isListLoading || undefined}>
          <ul className="flex flex-col gap-3">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </ul>
          <ListPagination
            page={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      ) : null}
    </main>
  );
}
