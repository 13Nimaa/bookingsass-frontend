"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AuthError } from "@/components/shared/auth-error";
import { useCustomerStore } from "@/features/customer/store/customer-store";
import {
  customerSchema,
  formatPhoneDisplay,
  toCreateCustomerInput,
  toUpdateCustomerInput,
  type CustomerFormData,
} from "@/features/customer/schemas/customer.schema";
import type { CustomerDto } from "@/features/customer/types";

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: number;
  customer?: CustomerDto | null;
  onSaved?: () => void;
}

const EMPTY: CustomerFormData = {
  name: "",
  phoneNumber: "",
  email: "",
  notes: "",
  isActive: true,
};

export function CustomerFormDialog({
  open,
  onOpenChange,
  businessId,
  customer = null,
  onSaved,
}: CustomerFormDialogProps) {
  const isEdit = customer !== null;
  const createCustomer = useCustomerStore((s) => s.createCustomer);
  const updateCustomer = useCustomerStore((s) => s.updateCustomer);
  const saving = useCustomerStore((s) => s.saving);
  const error = useCustomerStore((s) => s.error);
  const clearError = useCustomerStore((s) => s.clearError);

  const [discardOpen, setDiscardOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!open) {
      reset(EMPTY);
      clearError();
      setDiscardOpen(false);
      return;
    }
    if (customer) {
      reset({
        name: customer.name,
        phoneNumber: customer.phoneNumber
          ? formatPhoneDisplay(customer.phoneNumber)
          : "",
        email: customer.email ?? "",
        notes: customer.notes ?? "",
        isActive: customer.isActive,
      });
    } else {
      reset(EMPTY);
    }
    clearError();
  }, [open, customer, reset, clearError]);

  const requestClose = () => {
    if (saving) return;
    if (isDirty) {
      setDiscardOpen(true);
      return;
    }
    clearError();
    onOpenChange(false);
  };

  const onSubmit = async (data: CustomerFormData) => {
    const ok = customer
      ? await updateCustomer(businessId, customer.id, toUpdateCustomerInput(data))
      : await createCustomer(businessId, toCreateCustomerInput(data));
    if (ok) {
      clearError();
      onOpenChange(false);
      onSaved?.();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            requestClose();
            return;
          }
          onOpenChange(next);
        }}
      >
        <DialogContent
          showClose
          className="flex max-h-[calc(100dvh-2rem)] max-w-md flex-col overflow-hidden"
        >
          <DialogHeader className="shrink-0">
            <DialogTitle>
              {isEdit ? "ویرایش مشتری" : "افزودن مشتری"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "اطلاعات مشتری را به‌روزرسانی کنید."
                : "نام و اطلاعات تماس مشتری جدید را وارد کنید."}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mt-4 flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pe-1">
              {error && <AuthError message={error} />}

              <Input
                id="customer-name"
                label="نام مشتری"
                requiredMark
                autoComplete="name"
                autoFocus
                placeholder="مثلاً سارا محمدی"
                error={errors.name?.message}
                {...register("name")}
              />

              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    id="customer-phone"
                    label="شماره موبایل"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="0912 345 6789"
                    className="tnum text-start"
                    dir="ltr"
                    hint="اختیاری"
                    error={errors.phoneNumber?.message}
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={field.value}
                    onChange={(e) =>
                      field.onChange(formatPhoneDisplay(e.target.value))
                    }
                  />
                )}
              />

              <Input
                id="customer-email"
                label="ایمیل"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                className="text-start"
                dir="ltr"
                hint="اختیاری"
                error={errors.email?.message}
                {...register("email")}
              />

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="customer-notes"
                  className="block text-sm font-bold text-[#1e1b4b]"
                >
                  یادداشت{" "}
                  <span className="font-medium text-slate-400">(اختیاری)</span>
                </label>
                <textarea
                  id="customer-notes"
                  rows={3}
                  aria-invalid={!!errors.notes}
                  className={`w-full rounded-xl border px-4 py-3 text-[15px] font-medium outline-none transition-all duration-200 ${
                    errors.notes
                      ? "border-error focus:border-error focus:ring-4 focus:ring-error-soft"
                      : "border-border hover:border-border-strong focus:border-primary focus:ring-4 focus:ring-primary-soft"
                  }`}
                  placeholder="یادداشت داخلی دربارهٔ مشتری..."
                  {...register("notes")}
                />
                {errors.notes && (
                  <p className="text-[13px] leading-5 font-bold text-error-text">
                    {errors.notes.message}
                  </p>
                )}
              </div>

              {isEdit ? (
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <label
                      htmlFor="customer-active"
                      className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-surface-subtle px-3 py-3"
                    >
                      <Checkbox
                        id="customer-active"
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked)}
                      />
                      <span className="text-sm font-bold text-[#1e1b4b]">
                        مشتری فعال است
                      </span>
                    </label>
                  )}
                />
              ) : null}
            </div>

            <DialogFooter className="shrink-0 sm:justify-start">
              <Button
                type="submit"
                size="lg"
                className="h-11 px-6 text-[15px] font-bold"
                disabled={saving}
              >
                {saving && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                {saving
                  ? isEdit
                    ? "در حال ذخیره..."
                    : "در حال ثبت..."
                  : isEdit
                    ? "ذخیره تغییرات"
                    : "ثبت مشتری"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="h-11 px-5"
                onClick={requestClose}
                disabled={saving}
              >
                انصراف
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        title="لغو تغییرات"
        description="تغییرات ذخیره‌نشده دارید. آیا می‌خواهید فرم را ببندید؟"
        confirmLabel="بستن فرم"
        cancelLabel="ادامه ویرایش"
        tone="danger"
        onConfirm={() => {
          setDiscardOpen(false);
          clearError();
          onOpenChange(false);
        }}
      />
    </>
  );
}
