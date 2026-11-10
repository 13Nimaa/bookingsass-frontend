"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type Control,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Check,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { AuthError } from "@/components/shared/auth-error";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  employeeServiceAssignmentSchema,
  EMPTY_SERVICE_SELECTION,
  toAssignServiceInputs,
  type EmployeeServiceAssignmentFormData,
} from "@/features/employee/schemas/employee-service.schema";
import { useEmployeeStore } from "@/features/employee/store/employee-store";
import type {
  AssignServiceFailure,
  EmployeeDto,
} from "@/features/employee/types";
import { useServiceStore } from "@/features/service/store/service-store";
import {
  formatPriceDisplay,
  toAsciiDigits,
  toPersianDigits,
} from "@/features/service/schemas/service.schema";
import type { ServiceDto } from "@/features/service/types";
import { cn } from "cn";

interface AddEmployeeServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeDto;
  /** Service ids already assigned to this employee (excluded from selection). */
  assignedServiceIds: number[];
  onAssigned?: (count: number) => void;
}

function ServiceOptionSkeleton() {
  return (
    <li
      aria-hidden="true"
      className="rounded-2xl border border-border bg-surface p-3.5"
    >
      <div className="flex items-start gap-3">
        <span className="skeleton-shimmer mt-0.5 h-4 w-4 shrink-0 rounded" />
        <div className="flex-1 space-y-2">
          <span className="skeleton-shimmer block h-4 w-32 rounded bg-surface-secondary" />
          <span className="skeleton-shimmer block h-3 w-56 max-w-full rounded bg-surface-secondary" />
        </div>
      </div>
    </li>
  );
}

function ServiceOption({
  service,
  selected,
  index,
  control,
  disabled,
  onToggle,
  error,
}: {
  service: ServiceDto;
  selected: boolean;
  index: number;
  control: Control<EmployeeServiceAssignmentFormData>;
  disabled: boolean;
  onToggle: (checked: boolean) => void;
  error?: { price?: string; durationMinutes?: string };
}) {
  const priceId = `employee-service-price-${service.id}`;
  const durationId = `employee-service-duration-${service.id}`;
  const defaultsId = `employee-service-defaults-${service.id}`;

  return (
    <li
      className={cn(
        "rounded-2xl border p-3.5 transition-colors duration-150 motion-reduce:transition-none",
        selected
          ? "border-primary bg-primary-soft/40"
          : "border-border bg-surface hover:border-border-strong"
      )}
    >
      <label className="flex cursor-pointer items-start gap-3">
        <Checkbox
          className="mt-0.5"
          checked={selected}
          disabled={disabled}
          onCheckedChange={(checked) => onToggle(checked === true)}
          aria-describedby={defaultsId}
        />
        <span className="min-w-0 flex-1">
          <span
            className="block truncate text-[14px] leading-6 font-extrabold text-text-primary"
            title={service.title}
          >
            {service.title}
          </span>
          <span
            id={defaultsId}
            className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] leading-5 font-medium text-muted"
          >
            <span className="tnum">
              قیمت پیش‌فرض: {formatPrice(service.price)}
            </span>
            <span className="tnum">
              مدت پیش‌فرض: {formatDuration(service.durationMinutes)}
            </span>
          </span>
        </span>
      </label>

      {selected ? (
        <div className="mt-3 ps-7">
          <div className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2">
            <Controller
              name={`selections.${index}.price`}
              control={control}
              render={({ field }) => (
                <Input
                  id={priceId}
                  label="قیمت اختصاصی"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder={formatPriceDisplay(String(service.price))}
                  className="tnum h-11 ps-14 text-start"
                  dir="ltr"
                  endIcon={
                    <span className="text-[12px] font-bold text-slate-500">
                      تومان
                    </span>
                  }
                  error={error?.price}
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={formatPriceDisplay(field.value)}
                  disabled={disabled}
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
            <Controller
              name={`selections.${index}.durationMinutes`}
              control={control}
              render={({ field }) => (
                <Input
                  id={durationId}
                  label="مدت اختصاصی (دقیقه)"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder={toPersianDigits(String(service.durationMinutes))}
                  className="tnum h-11 text-start"
                  dir="ltr"
                  error={error?.durationMinutes}
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={
                    field.value
                      ? toPersianDigits(toAsciiDigits(field.value))
                      : ""
                  }
                  disabled={disabled}
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
          </div>
          <p className="mt-2 text-[11.5px] leading-5 font-medium text-text-disabled">
            هر فیلد را خالی بگذارید تا مقدار پیش‌فرض خدمت استفاده شود.
          </p>
        </div>
      ) : null}
    </li>
  );
}

/**
 * Assigns one or more of the business's services to a single employee.
 * Already-assigned services never appear in the selectable list. Price and
 * duration overrides are optional and independent; empty values are omitted
 * from the request so the service defaults are inherited.
 */
export function AddEmployeeServiceDialog({
  open,
  onOpenChange,
  employee,
  assignedServiceIds,
  onAssigned,
}: AddEmployeeServiceDialogProps) {
  const services = useServiceStore((state) => state.services);
  const servicesStatus = useServiceStore((state) => state.status);
  const servicesError = useServiceStore((state) => state.error);
  const fetchServices = useServiceStore((state) => state.fetchServices);
  const assigningServices = useEmployeeStore((state) => state.assigningServices);
  const assignServices = useEmployeeStore((state) => state.assignServices);

  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    assigned: number;
    failed: Array<AssignServiceFailure & { title: string }>;
  } | null>(null);
  const fetchRequested = useRef(false);

  const assignedIds = useMemo(
    () => new Set(assignedServiceIds),
    [assignedServiceIds]
  );
  const availableServices = useMemo(
    () => services.filter((service) => !assignedIds.has(service.id)),
    [services, assignedIds]
  );
  const titlesById = useMemo(
    () => new Map(services.map((service) => [service.id, service.title])),
    [services]
  );

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<EmployeeServiceAssignmentFormData>({
    resolver: zodResolver(employeeServiceAssignmentSchema),
    defaultValues: { selections: [] },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "selections",
  });
  const selections = useWatch({ control, name: "selections" });

  // Reset only through explicit close paths. The dialog unmounts with the
  // drawer, so state never leaks across employees.
  const resetDialogState = () => {
    reset({ selections: [] });
    setSelectionError(null);
    setFeedback(null);
  };

  const closeDialog = () => {
    // The closure may still hold `true` from the render that started the
    // submission, so block user-initiated closes while work is in flight.
    if (assigningServices) return;
    resetDialogState();
    onOpenChange(false);
  };

  useEffect(() => {
    if (!open) {
      fetchRequested.current = false;
      return;
    }
    // StrictMode/effect re-runs must not trigger a second list request.
    if (fetchRequested.current) return;
    if (servicesStatus === "idle") {
      fetchRequested.current = true;
      void fetchServices(employee.businessId);
    }
  }, [open, employee.businessId, servicesStatus, fetchServices]);

  // A successful (or conflicting) assignment can make a selected service
  // disappear from the available list. Drop such selections so the form never
  // submits a service that is no longer selectable.
  useEffect(() => {
    if (!open || servicesStatus !== "loaded") return;
    const validIds = new Set(availableServices.map((service) => service.id));
    const current = getValues("selections");
    const next = current.filter((selection) => validIds.has(selection.serviceId));
    if (next.length !== current.length) {
      reset({ selections: next });
    }
  }, [open, servicesStatus, availableServices, getValues, reset]);

  const requestClose = () => {
    closeDialog();
  };

  const toggleService = (serviceId: number, checked: boolean) => {
    setSelectionError(null);
    setFeedback(null);
    const index = fields.findIndex((field) => field.serviceId === serviceId);
    if (checked && index < 0) {
      append({ serviceId, ...EMPTY_SERVICE_SELECTION });
    } else if (!checked && index >= 0) {
      remove(index);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    if (data.selections.length === 0) {
      setSelectionError("حداقل یک خدمت را انتخاب کنید.");
      return;
    }

    setSelectionError(null);
    setFeedback(null);

    const result = await assignServices(
      employee.id,
      toAssignServiceInputs(data)
    );
    // `null` means another submission is already in progress.
    if (!result) return;

    if (result.failed.length === 0) {
      onAssigned?.(result.assigned);
      // Close without the in-flight guard: this result means the submission
      // has settled, so the dialog should not stay open.
      resetDialogState();
      onOpenChange(false);
      return;
    }

    // Partial failure: keep the failed rows (with their override drafts) so
    // the user can retry, but never present this as full success.
    const failedIds = new Set(result.failed.map((item) => item.serviceId));
    reset({
      selections: data.selections.filter((item) =>
        failedIds.has(item.serviceId)
      ),
    });
    setFeedback({
      assigned: result.assigned,
      failed: result.failed.map((item) => ({
        ...item,
        title: titlesById.get(item.serviceId) ?? "",
      })),
    });
  });

  const isLoading =
    servicesStatus === "idle" || servicesStatus === "loading";
  const isError = servicesStatus === "error";
  const isLoaded = servicesStatus === "loaded";
  const availableCount = availableServices.length.toLocaleString("fa-IR");
  const noBusinessServices = isLoaded && services.length === 0;
  const noSelectableServices =
    isLoaded && services.length > 0 && availableServices.length === 0;

  return (
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
        className="flex max-h-[calc(100dvh-2rem)] max-w-xl flex-col overflow-hidden"
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>افزودن خدمت</DialogTitle>
          <DialogDescription>
            خدمت‌های مورد نظر را برای «{employee.fullName}» انتخاب کنید. قیمت و
            مدت زمان اختصاصی اختیاری هستند.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={onSubmit}
          noValidate
          className="mt-4 flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pe-1">
            {feedback ? (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-error-border bg-error-soft px-3.5 py-3"
              >
                <p className="text-[13px] leading-6 font-extrabold text-error-text">
                  {feedback.assigned > 0
                    ? `${feedback.assigned.toLocaleString("fa-IR")} خدمت اختصاص یافت، اما ${feedback.failed.length.toLocaleString("fa-IR")} خدمت ثبت نشد.`
                    : "اختصاص خدمت انجام نشد."}
                </p>
                <ul className="mt-1.5 space-y-1 text-[12px] leading-5 font-medium text-error-text">
                  {feedback.failed.map((item) => (
                    <li key={item.serviceId}>
                      {item.title ? `«${item.title}»: ` : ""}
                      {item.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {isError ? (
              <div className="rounded-2xl border border-error-border bg-error-soft p-4">
                <AuthError
                  message={
                    servicesError ?? "دریافت فهرست خدمات ممکن نشد."
                  }
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="mt-3 h-10 gap-1.5 rounded-xl px-4 text-[13px] font-bold"
                  onClick={() => void fetchServices(employee.businessId)}
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  تلاش دوباره
                </Button>
              </div>
            ) : isLoading ? (
              <ul
                className="flex flex-col gap-2.5"
                aria-busy="true"
                aria-label="در حال بارگذاری خدمات"
              >
                {[0, 1, 2].map((item) => (
                  <ServiceOptionSkeleton key={item} />
                ))}
              </ul>
            ) : noBusinessServices ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-strong bg-surface px-5 py-9 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[14px] leading-6 font-extrabold text-text-primary">
                    هنوز خدمتی ثبت نشده است
                  </p>
                  <p className="mt-1 text-[12.5px] leading-6 font-medium text-muted">
                    ابتدا از بخش مدیریت خدمات، خدمت‌های سالن را ثبت کنید.
                  </p>
                </div>
              </div>
            ) : noSelectableServices ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-strong bg-surface px-5 py-9 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-success-soft text-success">
                  <Check className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[14px] leading-6 font-extrabold text-text-primary">
                    همهٔ خدمات اختصاص داده شده‌اند
                  </p>
                  <p className="mt-1 text-[12.5px] leading-6 font-medium text-muted">
                    تمام خدمت‌های سالن در حال حاضر به این کارمند تعلق دارند.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-[12px] leading-5 font-bold text-muted">
                    {availableCount} خدمت قابل افزودن
                  </p>
                  {selections.length > 0 ? (
                    <span className="rounded-md bg-primary-soft px-2 py-0.5 text-[11px] leading-4 font-bold text-primary">
                      {selections.length.toLocaleString("fa-IR")} انتخاب‌شده
                    </span>
                  ) : null}
                </div>
                <ul className="flex flex-col gap-2.5">
                  {availableServices.map((service) => {
                    const index = fields.findIndex(
                      (field) => field.serviceId === service.id
                    );
                    return (
                      <ServiceOption
                        key={service.id}
                        service={service}
                        selected={index >= 0}
                        index={index}
                        control={control}
                        disabled={assigningServices}
                        error={
                          index >= 0
                            ? {
                                price:
                                  errors.selections?.[index]?.price?.message,
                                durationMinutes:
                                  errors.selections?.[index]?.durationMinutes
                                    ?.message,
                              }
                            : undefined
                        }
                        onToggle={(checked) =>
                          toggleService(service.id, checked)
                        }
                      />
                    );
                  })}
                </ul>
              </>
            )}

            {selectionError ? (
              <p
                role="alert"
                className="mt-3 flex items-center gap-1.5 text-[12.5px] leading-5 font-bold text-error-text"
              >
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                {selectionError}
              </p>
            ) : null}
          </div>

          <DialogFooter className="mt-4 shrink-0 border-t border-border-subtle pt-4 sm:justify-start">
            <Button
              type="submit"
              size="lg"
              className="h-11 gap-1.5 px-6 text-[15px] font-bold"
              disabled={
                assigningServices ||
                servicesStatus !== "loaded" ||
                noBusinessServices ||
                noSelectableServices
              }
            >
              {assigningServices ? (
                <Loader2
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Plus className="h-4 w-4" aria-hidden="true" />
              )}
              {assigningServices
                ? "در حال اختصاص..."
                : selections.length > 1
                  ? `${selections.length.toLocaleString("fa-IR")} خدمت را اختصاص بده`
                  : "افزودن خدمت"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="h-11 px-5"
              onClick={requestClose}
              disabled={assigningServices}
            >
              انصراف
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
