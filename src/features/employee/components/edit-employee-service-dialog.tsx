"use client";

import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { AuthError } from "@/components/shared/auth-error";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatDuration, formatPrice } from "@/features/employee/lib/format";
import {
  employeeServiceOverrideSchema,
  toOverrideFormValues,
  toUpdateEmployeeServiceInput,
  type EmployeeServiceOverrideFormData,
} from "@/features/employee/schemas/employee-service.schema";
import { useEmployeeStore } from "@/features/employee/store/employee-store";
import type {
  EmployeeDto,
  EmployeeServiceDto,
} from "@/features/employee/types";
import {
  formatPriceDisplay,
  toAsciiDigits,
  toPersianDigits,
} from "@/features/service/schemas/service.schema";

interface EditEmployeeServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeDto;
  service: EmployeeServiceDto | null;
  onUpdated?: () => void;
}

/**
 * Edits price/duration overrides for one service already assigned to an
 * employee. Empty fields mean "inherit the salon default"; filled fields
 * are intentional custom values. Only changed fields are sent on save.
 */
export function EditEmployeeServiceDialog({
  open,
  onOpenChange,
  employee,
  service,
  onUpdated,
}: EditEmployeeServiceDialogProps) {
  const updatingService = useEmployeeStore((state) => state.updatingService);
  const updateEmployeeService = useEmployeeStore(
    (state) => state.updateEmployeeService
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EmployeeServiceOverrideFormData>({
    resolver: zodResolver(employeeServiceOverrideSchema),
    defaultValues: { price: "", durationMinutes: "" },
  });

  const priceValue = useWatch({ control, name: "price" });
  const durationValue = useWatch({ control, name: "durationMinutes" });

  // Keep the form synchronized with the selected employee-service whenever
  // the dialog opens or the underlying cached row changes after a refresh.
  useEffect(() => {
    if (!open || !service) return;
    reset(toOverrideFormValues(service));
  }, [open, service, reset]);

  const resetDialogState = () => {
    if (service) reset(toOverrideFormValues(service));
    else reset({ price: "", durationMinutes: "" });
    setSubmitError(null);
  };

  const closeDialog = () => {
    if (updatingService) return;
    resetDialogState();
    onOpenChange(false);
  };

  const onSubmit = handleSubmit(async (data) => {
    if (!service) return;
    setSubmitError(null);

    const patch = toUpdateEmployeeServiceInput(data, service);
    const result = await updateEmployeeService(
      employee.id,
      service.id,
      patch
    );
    if (!result) return;
    if (!result.ok) {
      setSubmitError(result.message);
      return;
    }

    onUpdated?.();
    resetDialogState();
    onOpenChange(false);
  });

  const priceIsCustom = (priceValue ?? "").trim() !== "";
  const durationIsCustom = (durationValue ?? "").trim() !== "";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          closeDialog();
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
          <DialogTitle>ویرایش تنظیمات خدمت</DialogTitle>
          <DialogDescription>
            قیمت و مدت زمان اختصاصی «{service?.title ?? "خدمت"}» را برای «
            {employee.fullName}» تنظیم کنید.
          </DialogDescription>
        </DialogHeader>

        {service ? (
          <form
            onSubmit={onSubmit}
            noValidate
            className="mt-4 flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pe-1">
              <div className="rounded-2xl border border-border bg-surface-subtle p-3.5">
                <p
                  className="truncate text-[15px] leading-6 font-extrabold text-text-primary"
                  title={service.title}
                >
                  {service.title}
                </p>
                <dl className="mt-3 grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-2">
                  <div className="rounded-xl border border-border-subtle bg-surface p-3">
                    <dt className="text-[11px] leading-4 font-bold text-muted">
                      قیمت پیش‌فرض سالن
                    </dt>
                    <dd className="tnum mt-1 text-[13px] leading-5 font-bold text-text-primary">
                      {formatPrice(service.defaultPrice)}
                    </dd>
                    <dt className="mt-2.5 text-[11px] leading-4 font-bold text-muted">
                      قیمت مؤثر فعلی
                    </dt>
                    <dd className="tnum mt-1 text-[13px] leading-5 font-extrabold text-text-primary">
                      {formatPrice(service.effectivePrice)}
                    </dd>
                    <p className="mt-2 text-[11px] leading-4 font-medium text-text-disabled">
                      {service.priceOverride == null
                        ? "در حال استفاده از پیش‌فرض سالن"
                        : "دارای مبلغ اختصاصی کارمند"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border-subtle bg-surface p-3">
                    <dt className="text-[11px] leading-4 font-bold text-muted">
                      مدت پیش‌فرض سالن
                    </dt>
                    <dd className="tnum mt-1 text-[13px] leading-5 font-bold text-text-primary">
                      {formatDuration(service.defaultDurationMinutes)}
                    </dd>
                    <dt className="mt-2.5 text-[11px] leading-4 font-bold text-muted">
                      مدت مؤثر فعلی
                    </dt>
                    <dd className="tnum mt-1 text-[13px] leading-5 font-extrabold text-text-primary">
                      {formatDuration(service.effectiveDurationMinutes)}
                    </dd>
                    <p className="mt-2 text-[11px] leading-4 font-medium text-text-disabled">
                      {service.durationMinutesOverride == null
                        ? "در حال استفاده از پیش‌فرض سالن"
                        : "دارای مدت اختصاصی کارمند"}
                    </p>
                  </div>
                </dl>
              </div>

              <div className="space-y-3">
                <div>
                  {priceIsCustom ? (
                    <div className="mb-1.5 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 rounded-lg px-2 text-[12px] font-bold text-muted"
                        disabled={updatingService}
                        onClick={() =>
                          setValue("price", "", {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                      >
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                        بازگشت قیمت به پیش‌فرض
                      </Button>
                    </div>
                  ) : null}
                  <Controller
                    name="price"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="edit-employee-service-price"
                        label="قیمت اختصاصی"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder={formatPriceDisplay(
                          String(service.defaultPrice)
                        )}
                        className="tnum h-11 ps-14 text-start"
                        dir="ltr"
                        endIcon={
                          <span className="text-[12px] font-bold text-slate-500">
                            تومان
                          </span>
                        }
                        error={errors.price?.message}
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={formatPriceDisplay(field.value)}
                        disabled={updatingService}
                        onChange={(event) => {
                          const raw = toAsciiDigits(event.target.value).replace(
                            /\D/g,
                            ""
                          );
                          field.onChange(raw);
                        }}
                      />
                    )}
                  />
                  <p className="mt-1.5 text-[11.5px] leading-5 font-medium text-text-disabled">
                    {priceIsCustom
                      ? "این مبلغ به‌عنوان قیمت اختصاصی کارمند ذخیره می‌شود."
                      : "فیلد خالی است؛ قیمت پیش‌فرض سالن استفاده می‌شود."}
                  </p>
                </div>

                <div>
                  {durationIsCustom ? (
                    <div className="mb-1.5 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 rounded-lg px-2 text-[12px] font-bold text-muted"
                        disabled={updatingService}
                        onClick={() =>
                          setValue("durationMinutes", "", {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                      >
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                        بازگشت مدت به پیش‌فرض
                      </Button>
                    </div>
                  ) : null}
                  <Controller
                    name="durationMinutes"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="edit-employee-service-duration"
                        label="مدت اختصاصی (دقیقه)"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder={toPersianDigits(
                          String(service.defaultDurationMinutes)
                        )}
                        className="tnum h-11 text-start"
                        dir="ltr"
                        error={errors.durationMinutes?.message}
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={
                          field.value
                            ? toPersianDigits(toAsciiDigits(field.value))
                            : ""
                        }
                        disabled={updatingService}
                        onChange={(event) => {
                          const raw = toAsciiDigits(event.target.value).replace(
                            /\D/g,
                            ""
                          );
                          field.onChange(raw);
                        }}
                      />
                    )}
                  />
                  <p className="mt-1.5 text-[11.5px] leading-5 font-medium text-text-disabled">
                    {durationIsCustom
                      ? "این مدت به‌عنوان مدت اختصاصی کارمند ذخیره می‌شود."
                      : "فیلد خالی است؛ مدت پیش‌فرض سالن استفاده می‌شود."}
                  </p>
                </div>
              </div>

              {submitError ? (
                <div className="rounded-xl border border-error-border bg-error-soft px-3.5 py-3">
                  <AuthError message={submitError} />
                </div>
              ) : null}
            </div>

            <DialogFooter className="mt-4 shrink-0 border-t border-border-subtle pt-4 sm:justify-start">
              <Button
                type="submit"
                size="lg"
                className="h-11 gap-1.5 px-6 text-[15px] font-bold"
                disabled={updatingService}
              >
                {updatingService ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Save className="h-4 w-4" aria-hidden="true" />
                )}
                {updatingService ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="h-11 px-5"
                onClick={closeDialog}
                disabled={updatingService}
              >
                انصراف
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
