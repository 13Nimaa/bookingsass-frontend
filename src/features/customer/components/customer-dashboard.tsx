"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  MoreVertical,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  UserRound,
  Store,
  Users,
  X,
  ArrowUpDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "cn";
import { PageHeader } from "@/components/shared/page-header";
import { AppToast } from "@/components/shared/app-toast";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JalaliDatePicker } from "@/features/employee/components/jalali-date-picker";
import {
  formatGregorianIsoToJalali,
  formatJalaliDate,
  jalaliToGregorianIso,
  todayJalali,
  type JalaliDate,
} from "@/features/employee/lib/jalali-date";
import { useBusinessStore } from "@/features/business/store/business-store";
import { useCustomerStore } from "@/features/customer/store/customer-store";
import type {
  CustomerDto,
  CustomerSortBy,
  CustomerSortOrder,
  ListCustomersParams,
} from "@/features/customer/types";
import { AuthError } from "@/components/shared/auth-error";
import { CustomerFormDialog } from "@/features/customer/components/customer-form-dialog";
import { CustomerDetailDialog } from "@/features/customer/components/customer-detail-dialog";

const PAGE_SIZE = 20;

type StatusFilter = "all" | "active" | "inactive";
type SortKey =
  | "newest"
  | "oldest"
  | "nameAsc"
  | "nameDesc"
  | "updated";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "همه مشتریان" },
  { value: "active", label: "مشتریان فعال" },
  { value: "inactive", label: "مشتریان غیرفعال" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "جدیدترین مشتریان" },
  { value: "oldest", label: "قدیمی‌ترین مشتریان" },
  { value: "nameAsc", label: "نام: الف تا ی" },
  { value: "nameDesc", label: "نام: ی تا الف" },
  { value: "updated", label: "آخرین به‌روزرسانی" },
];

const AVATAR_TONES = [
  "bg-primary-soft text-primary ring-primary-subtle",
  "bg-success-soft text-success-text ring-success-border",
  "bg-warning-soft text-warning-text ring-warning-border",
  "bg-error-soft text-error-text ring-error-border",
  "bg-surface-secondary text-slate-700 ring-border-strong",
] as const;

function avatarTone(id: number): string {
  return AVATAR_TONES[Math.abs(id) % AVATAR_TONES.length] ?? AVATAR_TONES[0];
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.length ? parts.map((p) => p[0]!).join("") : "";
}

function isoDatePart(iso: string): string {
  return iso.slice(0, 10);
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]!);
}

function CustomersBreadcrumb() {
  return (
    <nav aria-label="مسیر صفحه" className="mb-4">
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
        <li className="font-bold text-[#1e1b4b]" aria-current="page">
          مشتریان
        </li>
      </ol>
    </nav>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12px] font-bold",
        active
          ? "bg-success-soft text-success-text"
          : "bg-error-soft text-error-text",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          active ? "bg-success" : "bg-error",
        )}
      />
      {active ? "فعال" : "غیرفعال"}
    </span>
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
    : "تاریخ ثبت";

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}
        aria-label="فیلتر تاریخ ثبت"
        className={cn(
          "flex h-11 w-full min-w-[10.5rem] items-center justify-between gap-2 rounded-xl border bg-surface px-3 text-right text-[13px] font-bold outline-none transition-all duration-150 motion-reduce:transition-none sm:h-12 sm:text-[14px]",
          active
            ? "border-primary text-primary ring-2 ring-primary-soft"
            : "border-border text-text-primary hover:border-border-strong",
          "focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary-soft",
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <CalendarDays className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
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
          aria-label="انتخاب بازه تاریخ ثبت"
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

function CustomerRowMenu({
  customer,
  onView,
  onEdit,
  onDelete,
}: {
  customer: CustomerDto;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

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

  const stop = (e: MouseEvent) => e.stopPropagation();

  return (
    <div ref={rootRef} className="relative" onClick={stop}>
      <button
        type="button"
        aria-label={`عملیات ${customer.name}`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors duration-150 hover:bg-surface-secondary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none"
      >
        <MoreVertical className="h-4 w-4" aria-hidden="true" />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute end-0 z-30 mt-1 w-48 overflow-hidden rounded-2xl border border-border bg-surface py-1.5 shadow-[0_20px_45px_-24px_rgba(30,27,75,0.45)]"
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2.5 text-[13px] font-bold text-text-primary transition-colors hover:bg-primary-soft hover:text-primary"
            onClick={() => {
              setOpen(false);
              onView();
            }}
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            مشاهده جزئیات
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2.5 text-[13px] font-bold text-text-primary transition-colors hover:bg-primary-soft hover:text-primary"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            ویرایش مشتری
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2.5 text-[13px] font-bold text-error transition-colors hover:bg-error-soft"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            حذف مشتری
          </button>
        </div>
      ) : null}
    </div>
  );
}

function CustomerCard({
  customer,
  onOpen,
  onView,
  onEdit,
  onDelete,
  onCopyPhone,
}: {
  customer: CustomerDto;
  onOpen: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCopyPhone: (phone: string) => void;
}) {
  const initials = initialsOf(customer.name);
  const createdLabel = formatGregorianIsoToJalali(isoDatePart(customer.createdAt));
  const updatedLabel = customer.updatedAt
    ? formatGregorianIsoToJalali(isoDatePart(customer.updatedAt))
    : null;

  return (
    <li>
      <article
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
        }}
        aria-label={`مشتری ${customer.name}`}
        className="group cursor-pointer rounded-2xl border border-border bg-surface p-4 transition-[background-color,border-color] duration-150 hover:border-border-strong hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none sm:px-5 sm:py-4"
      >
        {/* Mobile card */}
        <div className="flex flex-col gap-3 md:hidden">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[14px] font-extrabold ring-1 ring-inset",
                avatarTone(customer.id),
              )}
            >
              {initials || <UserRound className="h-5 w-5" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold text-[#1e1b4b]">
                    {customer.name}
                  </p>
                  <div className="mt-1.5">
                    <StatusBadge active={customer.isActive} />
                  </div>
                </div>
                <CustomerRowMenu
                  customer={customer}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pe-1">
            {customer.phoneNumber ? (
              <div className="flex items-center gap-2">
                <p className="tnum min-w-0 flex-1 text-[14px] font-semibold text-slate-700" dir="ltr">
                  {formatPhone(customer.phoneNumber)}
                </p>
                <button
                  type="button"
                  aria-label="کپی شماره موبایل"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-primary-soft hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopyPhone(customer.phoneNumber!);
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null}
            {customer.email ? (
              <p className="truncate text-[13px] font-medium text-slate-500" dir="ltr">
                {customer.email}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-border-subtle pt-3 text-[12px] font-medium text-slate-500">
            <span>ثبت: {createdLabel}</span>
            {updatedLabel ? <span>به‌روزرسانی: {updatedLabel}</span> : null}
          </div>
        </div>

        {/* Desktop row */}
        <div className="hidden items-center gap-4 md:flex">
          <span
            aria-hidden="true"
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[14px] font-extrabold ring-1 ring-inset",
              avatarTone(customer.id),
            )}
          >
            {initials || <UserRound className="h-5 w-5" />}
          </span>

          <div className="min-w-0 flex-[1.4]">
            <p className="truncate text-[15px] font-bold text-[#1e1b4b]">
              {customer.name}
            </p>
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5">
              {customer.phoneNumber ? (
                <span className="tnum text-[13px] font-semibold text-slate-700" dir="ltr">
                  {formatPhone(customer.phoneNumber)}
                </span>
              ) : null}
              {customer.email ? (
                <span className="truncate text-[12px] font-medium text-slate-500" dir="ltr">
                  {customer.email}
                </span>
              ) : null}
            </div>
          </div>

          <div className="w-[5.5rem] shrink-0">
            <StatusBadge active={customer.isActive} />
          </div>

          <div className="hidden min-w-0 flex-1 flex-col gap-0.5 text-[12px] font-medium text-slate-500 lg:flex">
            <span>ثبت: {createdLabel}</span>
            {updatedLabel ? <span>به‌روزرسانی: {updatedLabel}</span> : null}
          </div>

          <CustomerRowMenu
            customer={customer}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </article>
    </li>
  );
}

function ListSkeleton() {
  return (
    <ul className="flex flex-col gap-2.5" aria-busy="true" aria-label="در حال بارگذاری">
      {Array.from({ length: 5 }, (_, i) => (
        <li
          key={i}
          className="rounded-2xl border border-border bg-surface p-4 sm:px-5 sm:py-4"
        >
          <div className="flex flex-col gap-3 md:hidden">
            <div className="flex items-center gap-3">
              <div className="skeleton-shimmer h-11 w-11 rounded-full bg-surface-secondary" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="skeleton-shimmer h-4 w-32 rounded bg-surface-secondary" />
                <div className="skeleton-shimmer h-5 w-16 rounded-lg bg-surface-secondary" />
              </div>
              <div className="skeleton-shimmer h-8 w-8 rounded-xl bg-surface-secondary" />
            </div>
            <div className="skeleton-shimmer h-4 w-40 rounded bg-surface-secondary" />
            <div className="skeleton-shimmer h-3 w-28 rounded bg-surface-secondary" />
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <div className="skeleton-shimmer h-11 w-11 rounded-full bg-surface-secondary" />
            <div className="min-w-0 flex-[1.4] space-y-2">
              <div className="skeleton-shimmer h-4 w-36 rounded bg-surface-secondary" />
              <div className="skeleton-shimmer h-3 w-52 rounded bg-surface-secondary" />
            </div>
            <div className="skeleton-shimmer h-6 w-16 rounded-lg bg-surface-secondary" />
            <div className="hidden flex-1 space-y-2 lg:block">
              <div className="skeleton-shimmer h-3 w-28 rounded bg-surface-secondary" />
              <div className="skeleton-shimmer h-3 w-32 rounded bg-surface-secondary" />
            </div>
            <div className="skeleton-shimmer h-8 w-8 rounded-xl bg-surface-secondary" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  icon: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        {icon}
      </span>
      <h2 className="text-[16px] font-bold text-[#1e1b4b]">{title}</h2>
      <p className="mt-2 max-w-sm text-[13px] leading-6 font-medium text-slate-600">
        {description}
      </p>
      <Button
        type="button"
        className="mt-5 h-11 gap-1.5 px-4 font-bold"
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  totalCount,
  rangeStart,
  rangeEnd,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalCount: number;
  rangeStart: number;
  rangeEnd: number;
  onPageChange: (page: number) => void;
}) {
  const pages = (() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const set = new Set(
      [1, totalPages, page, page - 1, page + 1].filter(
        (p) => p >= 1 && p <= totalPages,
      ),
    );
    return [...set].sort((a, b) => a - b);
  })();

  if (totalCount === 0) return null;

  return (
    <div className="flex flex-col gap-3 border-t border-border-subtle pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[13px] font-medium text-slate-600">
        نمایش {toPersianDigits(rangeStart)} تا {toPersianDigits(rangeEnd)} از{" "}
        {toPersianDigits(totalCount)} مشتری
      </p>

      <div className="flex items-center justify-between gap-2 sm:justify-end">
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

        {/* Mobile compact */}
        <p className="text-[13px] font-bold text-text-primary sm:hidden">
          {toPersianDigits(page)} / {toPersianDigits(totalPages)}
        </p>

        {/* Desktop page numbers */}
        <div className="hidden items-center gap-1 sm:flex">
          {pages.map((p, index) => {
            const prev = pages[index - 1];
            const showEllipsis = prev != null && p - prev > 1;
            return (
              <span key={p} className="flex items-center gap-1">
                {showEllipsis ? (
                  <span className="px-1 text-slate-400" aria-hidden="true">
                    …
                  </span>
                ) : null}
                <button
                  type="button"
                  aria-label={`صفحه ${toPersianDigits(p)}`}
                  aria-current={p === page ? "page" : undefined}
                  onClick={() => onPageChange(p)}
                  className={cn(
                    "flex h-10 min-w-10 items-center justify-center rounded-xl px-2 text-[13px] font-bold transition-colors duration-150 motion-reduce:transition-none",
                    p === page
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-secondary text-slate-600 hover:bg-primary-soft hover:text-primary",
                  )}
                >
                  {toPersianDigits(p)}
                </button>
              </span>
            );
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 gap-1 px-3"
          disabled={page >= totalPages}
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

function sortToApi(sort: SortKey): {
  sortBy: CustomerSortBy;
  sortOrder: CustomerSortOrder;
} {
  switch (sort) {
    case "oldest":
      return { sortBy: "createdAt", sortOrder: "asc" };
    case "nameAsc":
      return { sortBy: "name", sortOrder: "asc" };
    case "nameDesc":
      return { sortBy: "name", sortOrder: "desc" };
    case "updated":
      return { sortBy: "updatedAt", sortOrder: "desc" };
    case "newest":
    default:
      return { sortBy: "createdAt", sortOrder: "desc" };
  }
}

function buildListParams(input: {
  search: string;
  status: StatusFilter;
  sort: SortKey;
  dateFrom: JalaliDate | null;
  dateTo: JalaliDate | null;
  page: number;
}): ListCustomersParams {
  const { sortBy, sortOrder } = sortToApi(input.sort);
  const params: ListCustomersParams = {
    page: input.page,
    pageSize: PAGE_SIZE,
    sortBy,
    sortOrder,
  };
  const q = input.search.trim();
  if (q) params.search = q;
  if (input.status === "active") params.isActive = true;
  if (input.status === "inactive") params.isActive = false;
  let from = input.dateFrom ? jalaliToGregorianIso(input.dateFrom) : undefined;
  let to = input.dateTo ? jalaliToGregorianIso(input.dateTo) : undefined;
  if (from && to && from > to) {
    const swap = from;
    from = to;
    to = swap;
  }
  if (from) params.createdFrom = from;
  if (to) params.createdTo = to;
  return params;
}

export function CustomerDashboard() {
  const router = useRouter();

  const business = useBusinessStore((s) => s.business);
  const businessStatus = useBusinessStore((s) => s.status);
  const businessError = useBusinessStore((s) => s.error);
  const fetchMine = useBusinessStore((s) => s.fetchMine);

  const customers = useCustomerStore((s) => s.customers);
  const status = useCustomerStore((s) => s.status);
  const error = useCustomerStore((s) => s.error);
  const notice = useCustomerStore((s) => s.notice);
  const removingId = useCustomerStore((s) => s.removingId);
  const totalCount = useCustomerStore((s) => s.totalCount);
  const totalPages = useCustomerStore((s) => s.totalPages);
  const pageFromStore = useCustomerStore((s) => s.page);
  const fetchCustomers = useCustomerStore((s) => s.fetchCustomers);
  const removeCustomer = useCustomerStore((s) => s.removeCustomer);
  const clearNotice = useCustomerStore((s) => s.clearNotice);
  const clearError = useCustomerStore((s) => s.clearError);
  const reset = useCustomerStore((s) => s.reset);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [dateFrom, setDateFrom] = useState<JalaliDate | null>(null);
  const [dateTo, setDateTo] = useState<JalaliDate | null>(null);
  const [page, setPage] = useState(1);
  const [confirmCustomer, setConfirmCustomer] = useState<CustomerDto | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerDto | null>(null);
  const [detailCustomer, setDetailCustomer] = useState<CustomerDto | null>(null);
  const [localToast, setLocalToast] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  const businessId = business?.id;

  useEffect(() => {
    void fetchMine();
  }, [fetchMine]);

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
        sort,
        dateFrom,
        dateTo,
        page,
      }),
    [debouncedSearch, statusFilter, sort, dateFrom, dateTo, page],
  );

  useEffect(() => {
    if (!businessId) return;
    void fetchCustomers(businessId, listParams);
  }, [businessId, listParams, fetchCustomers]);

  useEffect(() => {
    if (error) setToastError(error);
  }, [error]);

  const filtersActive =
    search.trim().length > 0 ||
    statusFilter !== "all" ||
    sort !== "newest" ||
    dateFrom != null ||
    dateTo != null;

  const safeTotalPages = Math.max(1, totalPages || 1);
  const currentPage = pageFromStore || page;
  const rangeStart = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, totalCount);

  const clearFilters = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setSort("newest");
    setDateFrom(null);
    setDateTo(null);
    setPage(1);
  }, []);

  const showLocalToast = useCallback(
    (message: string, tone: "success" | "error" = "success") => {
      setLocalToast({ message, tone });
    },
    [],
  );

  const openCreate = () => {
    setEditingCustomer(null);
    setFormOpen(true);
  };

  const openEdit = (customer: CustomerDto) => {
    setDetailCustomer(null);
    setEditingCustomer(customer);
    setFormOpen(true);
  };

  const openDetail = (customer: CustomerDto) => {
    setDetailCustomer(customer);
  };

  const refreshList = useCallback(() => {
    if (businessId) void fetchCustomers(businessId, listParams);
  }, [businessId, fetchCustomers, listParams]);

  const handleDelete = async () => {
    if (!confirmCustomer || !businessId) return;
    const ok = await removeCustomer(businessId, confirmCustomer.id);
    if (ok) {
      setConfirmCustomer(null);
      void fetchCustomers(businessId, listParams);
    }
  };

  const handleCopyPhone = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      showLocalToast("شماره موبایل کپی شد");
    } catch {
      showLocalToast("عملیات انجام نشد. لطفاً دوباره تلاش کنید.", "error");
    }
  };

  const isInitialLoading =
    businessStatus === "idle" ||
    businessStatus === "loading" ||
    ((status === "idle" || status === "loading") && customers.length === 0);

  const emptyKind = useMemo(() => {
    if (status !== "loaded" && status !== "error") return null;
    if (totalCount > 0) return null;
    if (!filtersActive) return "none" as const;
    if (debouncedSearch) return "search" as const;
    return "filter" as const;
  }, [status, totalCount, filtersActive, debouncedSearch]);

  if (businessStatus === "idle" || businessStatus === "loading") {
    return (
      <main
        className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-4 py-8 sm:px-10 sm:py-10"
        aria-busy="true"
      >
        <CustomersBreadcrumb />
        <div className="skeleton-shimmer h-10 w-56 rounded-xl bg-surface-secondary" />
        <div className="skeleton-shimmer h-28 rounded-2xl bg-surface" />
        <ListSkeleton />
      </main>
    );
  }

  if (businessStatus === "error") {
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-10 sm:py-10">
        <CustomersBreadcrumb />
        <PageHeader
          hideBack
          title="مشتریان"
          description="برای مدیریت مشتریان، ابتدا باید اطلاعات کسب‌وکار شما دریافت شود."
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
        <CustomersBreadcrumb />
        <PageHeader
          hideBack
          title="مشتریان"
          description="مدیریت و مشاهده اطلاعات مشتریان سالن"
        />
        <div className="mt-8 flex flex-col items-center gap-4 rounded-[1.75rem] border border-dashed border-border-strong bg-surface-subtle px-6 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Store className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-[17px] font-extrabold text-[#1e1b4b]">
              ابتدا کسب‌وکار خود را ثبت کنید
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 font-medium text-slate-600">
              برای مدیریت مشتریان، ابتدا باید اطلاعات کسب‌وکار شما تکمیل شده باشد.
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
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-4 py-8 sm:gap-6 sm:px-10 sm:py-10">
      <CustomersBreadcrumb />

      <PageHeader
        hideBack
        title="مشتریان"
        badge={
          status === "loaded" || totalCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-primary-soft px-2.5 py-1 text-[12px] font-bold text-primary">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              {toPersianDigits(totalCount)} مشتری
            </span>
          ) : null
        }
        description="مدیریت و مشاهده اطلاعات مشتریان سالن"
        actions={
          <Button
            type="button"
            size="lg"
            className="h-11 gap-1.5 px-4 font-bold sm:h-12"
            onClick={openCreate}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            افزودن مشتری
          </Button>
        }
      />

      <section
        aria-label="جستجو و فیلتر مشتریان"
        className="rounded-2xl border border-border bg-surface p-3 sm:p-4"
      >
        <div className="flex flex-col gap-3">
          <div className="relative">
            <label htmlFor="customer-search" className="sr-only">
              جستجوی مشتری
            </label>
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              id="customer-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو بر اساس نام، شماره موبایل یا ایمیل..."
              className="h-12 w-full rounded-xl border border-border bg-surface pe-10 ps-10 text-[14px] font-medium text-text-primary outline-none transition-all duration-150 placeholder:text-text-disabled hover:border-border-strong focus:border-primary focus:ring-4 focus:ring-primary-soft motion-reduce:transition-none"
            />
            {search ? (
              <button
                type="button"
                aria-label="پاک کردن جستجو"
                className="absolute end-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-secondary hover:text-text-primary"
                onClick={() => setSearch("")}
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="min-w-0 sm:w-[11.5rem]">
              <p className="mb-1.5 text-[12px] font-bold text-slate-600">وضعیت مشتری</p>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  if (v == null) return;
                  setStatusFilter(v as StatusFilter);
                  setPage(1);
                }}
                items={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              >
                <SelectTrigger
                  className={cn(
                    "h-11 text-[13px] sm:h-12 sm:text-[14px]",
                    statusFilter !== "all" && "border-primary ring-2 ring-primary-soft",
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} label={o.label}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-0 sm:min-w-[12rem] sm:flex-1 lg:flex-none lg:w-[16rem]">
              <p className="mb-1.5 text-[12px] font-bold text-slate-600">تاریخ ثبت</p>
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

            <div className="min-w-0 sm:w-[13rem]">
              <p className="mb-1.5 text-[12px] font-bold text-slate-600">مرتب‌سازی</p>
              <Select
                value={sort}
                onValueChange={(v) => {
                  if (v == null) return;
                  setSort(v as SortKey);
                  setPage(1);
                }}
                items={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              >
                <SelectTrigger
                  className={cn(
                    "h-11 text-[13px] sm:h-12 sm:text-[14px]",
                    sort !== "newest" && "border-primary ring-2 ring-primary-soft",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
                    <SelectValue />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} label={o.label}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filtersActive ? (
              <Button
                type="button"
                variant="outline"
                className="h-11 gap-1.5 px-3 text-[13px] font-bold sm:h-12 sm:ms-auto"
                onClick={clearFilters}
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                پاک کردن فیلترها
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <section aria-label="فهرست مشتریان" className="flex flex-col gap-3">
        {isInitialLoading ? (
          <ListSkeleton />
        ) : status === "error" && customers.length === 0 ? (
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <p className="text-sm leading-6 font-semibold text-slate-600">
              {error ?? "دریافت فهرست مشتریان ممکن نشد."}
            </p>
            <div>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => businessId && void fetchCustomers(businessId, listParams)}
              >
                تلاش دوباره
              </Button>
            </div>
          </div>
        ) : emptyKind === "none" ? (
          <EmptyState
            title="هنوز مشتری‌ای ثبت نشده است"
            description="با افزودن اولین مشتری، مدیریت اطلاعات مشتریان سالن را شروع کنید."
            actionLabel="افزودن اولین مشتری"
            onAction={openCreate}
            icon={<Users className="h-5 w-5" aria-hidden="true" />}
          />
        ) : emptyKind === "search" ? (
          <EmptyState
            title="مشتری‌ای پیدا نشد"
            description="مشتری‌ای با عبارت جستجوی شما مطابقت ندارد."
            actionLabel="پاک کردن جستجو"
            onAction={() => setSearch("")}
            icon={<Search className="h-5 w-5" aria-hidden="true" />}
          />
        ) : emptyKind === "filter" ? (
          <EmptyState
            title="موردی مطابق فیلترها پیدا نشد"
            description="فیلترهای انتخاب‌شده را تغییر دهید یا همه فیلترها را پاک کنید."
            actionLabel="پاک کردن فیلترها"
            onAction={clearFilters}
            icon={<RotateCcw className="h-5 w-5" aria-hidden="true" />}
          />
        ) : (
          <>
            <ul
              className={cn(
                "flex flex-col gap-2.5 transition-opacity duration-150",
                status === "loading" && "opacity-60",
              )}
            >
              {customers.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  onOpen={() => openDetail(customer)}
                  onView={() => openDetail(customer)}
                  onEdit={() => openEdit(customer)}
                  onDelete={() => setConfirmCustomer(customer)}
                  onCopyPhone={handleCopyPhone}
                />
              ))}
            </ul>
            <Pagination
              page={currentPage}
              totalPages={safeTotalPages}
              totalCount={totalCount}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              onPageChange={setPage}
            />
          </>
        )}
      </section>

      {businessId ? (
        <>
          <CustomerFormDialog
            open={formOpen}
            onOpenChange={(open) => {
              setFormOpen(open);
              if (!open) setEditingCustomer(null);
            }}
            businessId={businessId}
            customer={editingCustomer}
            onSaved={refreshList}
          />
          <CustomerDetailDialog
            open={detailCustomer != null}
            onOpenChange={(open) => {
              if (!open) setDetailCustomer(null);
            }}
            businessId={businessId}
            customerId={detailCustomer?.id ?? null}
            initialCustomer={detailCustomer}
            onEdit={openEdit}
            onDeleted={refreshList}
          />
        </>
      ) : null}

      <ConfirmDialog
        open={confirmCustomer != null}
        onOpenChange={(open) => {
          if (!open && removingId == null) setConfirmCustomer(null);
        }}
        title="حذف مشتری"
        description="آیا از حذف این مشتری اطمینان دارید؟ این عملیات ممکن است قابل بازگشت نباشد."
        confirmLabel="حذف مشتری"
        cancelLabel="انصراف"
        tone="danger"
        loading={removingId != null}
        onConfirm={() => void handleDelete()}
      />

      <AppToast
        message={formOpen ? null : notice}
        tone="success"
        onDismiss={clearNotice}
      />
      <AppToast
        message={formOpen ? null : toastError}
        tone="error"
        onDismiss={() => {
          setToastError(null);
          clearError();
        }}
      />
      <AppToast
        message={localToast?.message ?? null}
        tone={localToast?.tone}
        onDismiss={() => setLocalToast(null)}
      />
    </main>
  );
}
