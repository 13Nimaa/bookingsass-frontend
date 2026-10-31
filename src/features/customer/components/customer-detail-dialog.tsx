"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Loader2,
  Mail,
  Pencil,
  Phone,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AuthError } from "@/components/shared/auth-error";
import { getCustomerRequest } from "@/lib/api/endpoints/customer.endpoints";
import { useCustomerStore } from "@/features/customer/store/customer-store";
import { formatGregorianIsoToJalali } from "@/features/employee/lib/jalali-date";
import { formatPhoneDisplay } from "@/features/customer/schemas/customer.schema";
import type { CustomerDto } from "@/features/customer/types";
import { cn } from "cn";

interface CustomerDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: number;
  customerId: number | null;
  initialCustomer?: CustomerDto | null;
  onEdit: (customer: CustomerDto) => void;
  onDeleted?: () => void;
}

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

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-border-subtle py-3 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <dt className="shrink-0 text-[13px] font-bold text-slate-500">{label}</dt>
      <dd className="min-w-0 text-[14px] font-semibold text-[#1e1b4b] sm:text-end">
        {children}
      </dd>
    </div>
  );
}

export function CustomerDetailDialog({
  open,
  onOpenChange,
  businessId,
  customerId,
  initialCustomer = null,
  onEdit,
  onDeleted,
}: CustomerDetailDialogProps) {
  const removeCustomer = useCustomerStore((s) => s.removeCustomer);
  const updateCustomer = useCustomerStore((s) => s.updateCustomer);
  const removingId = useCustomerStore((s) => s.removingId);
  const saving = useCustomerStore((s) => s.saving);

  const [customer, setCustomer] = useState<CustomerDto | null>(initialCustomer);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const seedRef = useRef(initialCustomer);
  seedRef.current = initialCustomer;

  useEffect(() => {
    if (!open || customerId == null) {
      setCustomer(null);
      setError(null);
      setLoading(false);
      setConfirmDelete(false);
      return;
    }

    const seed = seedRef.current;
    setCustomer(seed?.id === customerId ? seed : null);
    setError(null);

    let cancelled = false;
    setLoading(true);

    void (async () => {
      try {
        const res = await getCustomerRequest(businessId, customerId);
        if (cancelled) return;
        if (!res.ok) {
          setError(
            res.status === 404
              ? "مشتری یافت نشد."
              : "دریافت جزئیات مشتری ممکن نشد.",
          );
          setLoading(false);
          return;
        }
        const data = (await res.json()) as CustomerDto;
        if (!cancelled) {
          setCustomer(data);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError("اتصال به سرور ممکن نیست. لطفاً دوباره تلاش کنید.");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, businessId, customerId]);

  const handleDelete = async () => {
    if (!customer) return;
    const ok = await removeCustomer(businessId, customer.id);
    if (ok) {
      setConfirmDelete(false);
      onOpenChange(false);
      onDeleted?.();
    }
  };

  const handleReactivate = async () => {
    if (!customer) return;
    const ok = await updateCustomer(businessId, customer.id, {
      name: customer.name,
      phoneNumber: customer.phoneNumber,
      email: customer.email,
      notes: customer.notes,
      isActive: true,
    });
    if (ok) {
      setCustomer((c) => (c ? { ...c, isActive: true } : c));
      onDeleted?.(); // refresh list
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent showClose className="max-w-md">
          <DialogHeader>
            <DialogTitle>جزئیات مشتری</DialogTitle>
            <DialogDescription>
              مشاهده اطلاعات و وضعیت مشتری
            </DialogDescription>
          </DialogHeader>

          {error && !customer ? (
            <div className="mt-5">
              <AuthError message={error} />
            </div>
          ) : null}

          {loading && !customer ? (
            <div className="mt-8 flex justify-center py-10" aria-busy="true">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : customer ? (
            <div className="mt-5">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold ring-1 ring-inset",
                    avatarTone(customer.id),
                  )}
                >
                  {initialsOf(customer.name) || (
                    <UserRound className="h-5 w-5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[17px] font-extrabold text-[#1e1b4b]">
                    {customer.name}
                  </p>
                  <span
                    className={cn(
                      "mt-1.5 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12px] font-bold",
                      customer.isActive
                        ? "bg-success-soft text-success-text"
                        : "bg-error-soft text-error-text",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        customer.isActive ? "bg-success" : "bg-error",
                      )}
                    />
                    {customer.isActive ? "فعال" : "غیرفعال"}
                  </span>
                </div>
                {loading ? (
                  <Loader2
                    className="h-4 w-4 shrink-0 animate-spin text-muted"
                    aria-label="در حال به‌روزرسانی"
                  />
                ) : null}
              </div>

              <dl className="mt-4">
                <DetailRow label="موبایل">
                  {customer.phoneNumber ? (
                    <span className="inline-flex items-center gap-1.5 tnum" dir="ltr">
                      <Phone className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
                      {formatPhoneDisplay(customer.phoneNumber)}
                    </span>
                  ) : (
                    <span className="font-medium text-slate-400">—</span>
                  )}
                </DetailRow>
                <DetailRow label="ایمیل">
                  {customer.email ? (
                    <span className="inline-flex max-w-full items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
                      <span className="truncate" dir="ltr">
                        {customer.email}
                      </span>
                    </span>
                  ) : (
                    <span className="font-medium text-slate-400">—</span>
                  )}
                </DetailRow>
                <DetailRow label="یادداشت">
                  {customer.notes?.trim() ? (
                    <span className="whitespace-pre-wrap font-medium leading-6">
                      {customer.notes}
                    </span>
                  ) : (
                    <span className="font-medium text-slate-400">—</span>
                  )}
                </DetailRow>
                <DetailRow label="تاریخ ثبت">
                  {formatGregorianIsoToJalali(isoDatePart(customer.createdAt))}
                </DetailRow>
                <DetailRow label="آخرین به‌روزرسانی">
                  {customer.updatedAt
                    ? formatGregorianIsoToJalali(isoDatePart(customer.updatedAt))
                    : "—"}
                </DetailRow>
              </dl>

              {error ? (
                <div className="mt-3">
                  <AuthError message={error} />
                </div>
              ) : null}

              <DialogFooter className="mt-5 flex-wrap sm:justify-start">
                <Button
                  type="button"
                  size="lg"
                  className="h-11 gap-1.5 px-4 font-bold"
                  onClick={() => onEdit(customer)}
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  ویرایش
                </Button>
                {!customer.isActive ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    className="h-11 px-4 font-bold"
                    disabled={saving}
                    onClick={() => void handleReactivate()}
                  >
                    {saving && (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    )}
                    فعال‌سازی مجدد
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    className="h-11 gap-1.5 px-4 text-error hover:bg-error-soft hover:text-error"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    حذف
                  </Button>
                )}
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="حذف مشتری"
        description="آیا از حذف این مشتری اطمینان دارید؟ این عملیات ممکن است قابل بازگشت نباشد."
        confirmLabel="حذف مشتری"
        cancelLabel="انصراف"
        tone="danger"
        loading={removingId != null}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}
