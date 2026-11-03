"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Plus, RefreshCw, Sparkles, X } from "lucide-react";
import { AppToast } from "@/components/shared/app-toast";
import { AuthError } from "@/components/shared/auth-error";
import { Button } from "@/components/ui/button";
import { AddEmployeeServiceDialog } from "@/features/employee/components/add-employee-service-dialog";
import { EditEmployeeServiceDialog } from "@/features/employee/components/edit-employee-service-dialog";
import { EmployeeServiceCard } from "@/features/employee/components/employee-service-card";
import { useEmployeeStore } from "@/features/employee/store/employee-store";
import type { EmployeeDto, EmployeeServiceDto } from "@/features/employee/types";

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.length ? parts.map((part) => part[0]).join("") : "ک";
}

function ServiceCardSkeleton() {
  return (
    <li
      aria-hidden="true"
      className="rounded-2xl border border-border bg-surface p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="skeleton-shimmer h-4 w-40 rounded bg-surface-secondary" />
        <div className="flex shrink-0 items-center gap-1">
          <span className="skeleton-shimmer h-9 w-9 rounded-lg bg-surface-secondary" />
          <span className="skeleton-shimmer h-9 w-9 rounded-lg bg-surface-secondary" />
        </div>
      </div>
      <div className="mt-3 grid min-w-0 grid-cols-1 gap-2 min-[380px]:grid-cols-2">
        <span className="skeleton-shimmer block h-[92px] rounded-xl bg-surface-secondary" />
        <span className="skeleton-shimmer block h-[92px] rounded-xl bg-surface-secondary" />
      </div>
    </li>
  );
}

interface EmployeeServicesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeDto | null;
  /** Remove remains out of scope for Phase 4. */
  onRemoveService?: (service: EmployeeServiceDto) => void;
}

/**
 * Centered modal (Dialog-convention shell like `dialog.tsx`) for viewing
 * the services assigned to one employee. Assigned services are fetched
 * from `GET /api/employees/:employeeId/services` when the drawer opens
 * and cached per employee in `useEmployeeStore`.
 */
export function EmployeeServicesDrawer({
  open,
  onOpenChange,
  employee,
  onRemoveService,
}: EmployeeServicesDrawerProps) {
  const employeeId = employee?.id ?? null;
  const entry = useEmployeeStore((state) =>
    employeeId === null ? undefined : state.servicesByEmployee[employeeId]
  );
  const loadEmployeeServices = useEmployeeStore(
    (state) => state.loadEmployeeServices
  );
  const [addOpen, setAddOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!open || employeeId === null) return;
    void loadEmployeeServices(employeeId);
  }, [open, employeeId, loadEmployeeServices]);

  // Closing the drawer (Esc / backdrop / close button) also closes the
  // nested dialogs and clears toast feedback.
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setAddOpen(false);
      setEditingServiceId(null);
      setToast(null);
    }
    onOpenChange(next);
  };

  const services = entry?.items ?? [];
  const assignedServiceIds = useMemo(
    () => (entry?.items ?? []).map((service) => service.id),
    [entry?.items]
  );
  // Resolve from the live cache so the edit dialog stays aligned with the
  // selected employee's current employee-service row after refreshes.
  const editingService =
    editingServiceId === null
      ? null
      : ((entry?.items ?? []).find(
          (service) => service.id === editingServiceId
        ) ?? null);
  const status = entry?.status ?? "idle";
  const isLoading =
    employeeId !== null && (status === "idle" || status === "loading");
  const isError = status === "error";
  const isLoaded = status === "loaded";
  const serviceCount = services.length.toLocaleString("fa-IR");
  // EmployeeDto exposes no image URL yet; initials fallback until a
  // profile image field exists on the response.
  const avatarContent = employee ? (
    <span
      aria-hidden="true"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[14px] font-extrabold text-primary ring-1 ring-primary-subtle ring-inset"
    >
      {initialsOf(employee.fullName)}
    </span>
  ) : null;

  return (
    <>
      <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
        <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 min-h-dvh bg-[#1e1b4b]/45 backdrop-blur-[2px] transition-opacity duration-200 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 supports-[-webkit-touch-callout:none]:absolute" />
        <DialogPrimitive.Viewport className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain p-4">
          <DialogPrimitive.Popup
          className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-[1.75rem] border border-border bg-surface text-[#1e1b4b] shadow-[0_30px_70px_-30px_rgba(30,27,75,0.5)] outline-none transition-[transform,opacity] duration-200 ease-out data-[starting-style]:translate-y-2 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0 data-[ending-style]:translate-y-1 data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 motion-reduce:transition-none"
        >
          {/* Header */}
          <div className="relative shrink-0 border-b border-border-subtle px-4 py-4 ps-16 sm:px-6 sm:ps-17">
            <DialogPrimitive.Close
              aria-label="بستن"
              className="absolute top-4 start-4 flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-surface-secondary hover:text-[#1e1b4b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.96]"
            >
              <X className="h-4.5 w-4.5" aria-hidden="true" />
            </DialogPrimitive.Close>
            <div className="flex items-center gap-3">
              {avatarContent}
              <div className="min-w-0">
                <p className="text-[11px] leading-4 font-bold text-primary">
                  خدمات کارمند
                </p>
                {employee ? (
                  <>
                    <DialogPrimitive.Title className="mt-0.5 block truncate text-[16px] leading-6 font-extrabold text-text-primary">
                      {employee.fullName}
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Description className="mt-0.5 block truncate text-[12px] leading-5 font-medium text-muted">
                      <span className="tnum tracking-wide" dir="ltr">
                        {employee.phoneNumber}
                      </span>
                    </DialogPrimitive.Description>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {/* Content: single scroll region to avoid nested scrolling */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] leading-6 font-extrabold text-text-primary">
                  خدمات اختصاص‌یافته
                </h2>
                {isLoaded ? (
                  <span className="rounded-md bg-primary-soft px-2 py-0.5 text-[11px] leading-4 font-bold text-primary">
                    {serviceCount} خدمت
                  </span>
                ) : null}
              </div>
              <Button
                type="button"
                size="sm"
                className="h-9 gap-1.5 rounded-xl px-3 text-[13px] font-bold"
                onClick={() => setAddOpen(true)}
                disabled={!isLoaded}
                title={
                  isLoaded
                    ? undefined
                    : isError
                      ? "ابتدا خطای دریافت خدمات را برطرف کنید."
                      : "در حال دریافت خدمات کارمند..."
                }
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                افزودن خدمت
              </Button>
            </div>

            {employee === null ? null : isError ? (
              /* Error state — never fall through to the empty state */
              <div className="mt-5 rounded-2xl border border-error-border bg-error-soft p-4">
                <AuthError
                  message={
                    entry?.error ?? "دریافت خدمات این کارمند ممکن نشد."
                  }
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="mt-3 h-10 gap-1.5 rounded-xl px-4 text-[13px] font-bold"
                  onClick={() =>
                    void loadEmployeeServices(employee.id, { force: true })
                  }
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  تلاش دوباره
                </Button>
              </div>
            ) : isLoading ? (
              /* Loading state — prevents an empty-state flash before data arrives */
              <ul
                className="mt-4 flex flex-col gap-3"
                aria-busy="true"
                aria-label="در حال بارگذاری خدمات"
              >
                {[0, 1].map((item) => (
                  <ServiceCardSkeleton key={item} />
                ))}
              </ul>
            ) : services.length === 0 ? (
              /* Empty state — only after a successful zero-item response */
              <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-strong bg-surface px-6 py-10 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[15px] leading-6 font-extrabold text-text-primary">
                    هنوز خدمتی اختصاص داده نشده است
                  </p>
                  <p className="mx-auto mt-1.5 max-w-xs text-[13px] leading-6 font-medium text-muted">
                    این کارمند در حال حاضر هیچ خدمتی برای انجام ندارد.
                  </p>
                </div>
                <Button
                  type="button"
                  size="lg"
                  className="h-10 gap-1.5 rounded-xl px-5 text-[13px] font-bold"
                  onClick={() => setAddOpen(true)}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  افزودن اولین خدمت
                </Button>
              </div>
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {services.map((service) => (
                  <EmployeeServiceCard
                    key={service.id}
                    service={service}
                    onEdit={(item) => setEditingServiceId(item.id)}
                    onRemove={onRemoveService}
                  />
                ))}
              </ul>
            )}

            <span className="sr-only" role="status" aria-live="polite">
              {isLoaded
                ? `${serviceCount} خدمت بارگذاری شد.`
                : isError
                  ? "دریافت خدمات این کارمند ناموفق بود."
                  : ""}
            </span>
          </div>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Viewport>
      </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {employee ? (
        <AddEmployeeServiceDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          employee={employee}
          assignedServiceIds={assignedServiceIds}
          onAssigned={(count) =>
            setToast(
              count === 1
                ? "خدمت با موفقیت به کارمند اختصاص یافت."
                : `${count.toLocaleString("fa-IR")} خدمت با موفقیت به کارمند اختصاص یافت.`
            )
          }
        />
      ) : null}

      {employee ? (
        <EditEmployeeServiceDialog
          open={editingServiceId !== null && editingService !== null}
          onOpenChange={(next) => {
            if (!next) setEditingServiceId(null);
          }}
          employee={employee}
          service={editingService}
          onUpdated={() =>
            setToast("تنظیمات خدمت با موفقیت به‌روز شد.")
          }
        />
      ) : null}

      <AppToast
        message={toast}
        tone="success"
        onDismiss={() => setToast(null)}
      />
    </>
  );
}
