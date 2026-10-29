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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AuthError } from "@/components/shared/auth-error";
import { useServiceStore } from "@/features/service/store/service-store";
import {
  DURATION_PRESETS,
  formatPriceDisplay,
  serviceSchema,
  toAsciiDigits,
  toPersianDigits,
  toServiceInput,
  type ServiceFormData,
} from "@/features/service/schemas/service.schema";
import type { ServiceDto } from "@/features/service/types";
import { cn } from "cn";

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: number;
  service?: ServiceDto | null;
}

export function ServiceFormDialog({
  open,
  onOpenChange,
  businessId,
  service = null,
}: ServiceFormDialogProps) {
  const isEdit = service !== null;
  const createService = useServiceStore((s) => s.createService);
  const updateService = useServiceStore((s) => s.updateService);
  const saving = useServiceStore((s) => s.saving);
  const error = useServiceStore((s) => s.error);
  const clearError = useServiceStore((s) => s.clearError);

  const [discardOpen, setDiscardOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: "",
      price: "",
      durationMinutes: "",
    },
  });

  const durationValue = watch("durationMinutes");

  useEffect(() => {
    if (!open) {
      reset({ title: "", price: "", durationMinutes: "" });
      clearError();
      setDiscardOpen(false);
      return;
    }
    if (service) {
      reset({
        title: service.title,
        price: String(service.price),
        durationMinutes: String(service.durationMinutes),
      });
    } else {
      reset({ title: "", price: "", durationMinutes: "" });
    }
    clearError();
  }, [open, service, reset, clearError]);

  const requestClose = () => {
    if (saving) return;
    if (isDirty) {
      setDiscardOpen(true);
      return;
    }
    clearError();
    onOpenChange(false);
  };

  const confirmDiscard = () => {
    setDiscardOpen(false);
    clearError();
    onOpenChange(false);
  };

  const onSubmit = async (data: ServiceFormData) => {
    const input = toServiceInput(data);
    const ok = service
      ? await updateService(businessId, service.id, input)
      : await createService(businessId, input);
    if (ok) {
      clearError();
      onOpenChange(false);
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
        <DialogContent showClose>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "ویرایش خدمت" : "افزودن خدمت"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "عنوان، قیمت و مدت زمان خدمت را به‌روزرسانی کنید."
                : "عنوان، قیمت و مدت زمان خدمت جدید را وارد کنید."}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mt-5 flex flex-col gap-4"
          >
            {error && <AuthError message={error} />}

            <Input
              id="service-title"
              label="عنوان خدمت"
              requiredMark
              autoComplete="off"
              autoFocus
              placeholder="مثلاً: کوتاهی مو"
              error={errors.title?.message}
              {...register("title")}
            />

            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <Input
                  id="service-price"
                  label="قیمت"
                  requiredMark
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder={formatPriceDisplay("250000")}
                  className="tnum ps-16 text-start"
                  dir="ltr"
                  endIcon={
                    <span className="text-[13px] font-bold text-slate-500">
                      تومان
                    </span>
                  }
                  error={errors.price?.message}
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={formatPriceDisplay(field.value)}
                  onChange={(e) => {
                    const raw = toAsciiDigits(e.target.value).replace(/\D/g, "");
                    field.onChange(raw);
                  }}
                />
              )}
            />

            <div className="flex flex-col gap-2.5">
              <Controller
                name="durationMinutes"
                control={control}
                render={({ field }) => (
                  <Input
                    id="service-duration"
                    label="مدت زمان (دقیقه)"
                    requiredMark
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder={toPersianDigits("30")}
                    className="tnum text-start"
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
                    onChange={(e) => {
                      const raw = toAsciiDigits(e.target.value).replace(
                        /\D/g,
                        ""
                      );
                      field.onChange(raw);
                    }}
                  />
                )}
              />

              <div
                role="group"
                aria-label="میانبر مدت زمان"
                className="flex flex-wrap gap-2"
              >
                {DURATION_PRESETS.map((minutes) => {
                  const active =
                    toAsciiDigits(durationValue ?? "") === String(minutes);
                  return (
                    <button
                      key={minutes}
                      type="button"
                      onClick={() =>
                        setValue("durationMinutes", String(minutes), {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      className={cn(
                        "h-9 rounded-xl border px-3 text-[13px] font-bold tnum transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                        active
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-border bg-surface text-slate-600 hover:border-border-strong hover:bg-surface-subtle"
                      )}
                    >
                      {minutes.toLocaleString("fa-IR")} دقیقه
                    </button>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="sm:justify-start">
              <Button
                type="submit"
                size="lg"
                className="h-11 px-6 text-[15px] font-bold"
                disabled={saving}
              >
                {saving && (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                {saving
                  ? isEdit
                    ? "در حال ذخیره..."
                    : "در حال ثبت..."
                  : isEdit
                    ? "ذخیره تغییرات"
                    : "ثبت خدمت"}
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
        onConfirm={confirmDiscard}
      />
    </>
  );
}
