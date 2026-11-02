"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Clock,
  Loader2,
  Pencil,
  Plus,
  Sparkles,
  Store,
  Trash2,
} from "lucide-react";
import { useBusinessStore } from "@/features/business/store/business-store";
import { useServiceStore } from "@/features/service/store/service-store";
import { PageHeader } from "@/components/shared/page-header";
import { AppToast } from "@/components/shared/app-toast";
import { Button } from "@/components/ui/button";
import { AuthError } from "@/components/shared/auth-error";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ServiceFormDialog } from "@/features/service/components/service-form-dialog";
import type { ServiceDto } from "@/features/service/types";
import { cn } from "cn";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1] as const,
      delay: i * 0.06,
    },
  }),
};

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

function titleInitial(title: string): string {
  const trimmed = title.trim();
  return trimmed ? trimmed[0]! : "؟";
}

function formatPrice(price: number): string {
  return `${price.toLocaleString("fa-IR")} تومان`;
}

function formatDuration(minutes: number): string {
  return `${minutes.toLocaleString("fa-IR")} دقیقه`;
}

function LoadingState() {
  return (
    <main
      className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-10 sm:py-10"
      aria-busy="true"
    >
      <PageHeader title="مدیریت خدمات" description="در حال بارگذاری…" />
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="skeleton-shimmer h-[96px] rounded-2xl bg-surface"
          />
        ))}
      </div>
    </main>
  );
}

interface ServiceRowProps {
  service: ServiceDto;
  removing: boolean;
  onEdit: () => void;
  onRemove: () => void;
}

function ServiceCard({ service, removing, onEdit, onRemove }: ServiceRowProps) {
  return (
    <li className="group flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 transition-all duration-200 hover:border-border-strong hover:shadow-[0_16px_32px_-22px_rgba(79,70,229,0.35)] motion-reduce:transition-none sm:p-5">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[17px] font-extrabold ring-1 ring-inset",
            avatarTone(service.id)
          )}
        >
          {titleInitial(service.title)}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold text-[#1e1b4b]">
            {service.title}
          </p>
          <p className="mt-1.5 flex flex-col gap-1 text-[14px] leading-5 text-slate-700 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3">
            <span className="inline-flex items-center gap-1.5 font-semibold tnum">
              {formatPrice(service.price)}
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="tnum">{formatDuration(service.durationMinutes)}</span>
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 border-t border-border-subtle pt-3">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="h-10 gap-1.5 px-3 text-[13px] font-bold"
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
          ویرایش
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`حذف ${service.title}`}
          title="حذف خدمت"
          className="h-10 w-10 min-h-10 min-w-10 text-slate-500 hover:bg-error-soft hover:text-error"
          onClick={onRemove}
          disabled={removing}
        >
          {removing ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>
    </li>
  );
}

function ServicesBreadcrumb() {
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
        <li className="font-bold text-[#1e1b4b]" aria-current="page">
          خدمات
        </li>
      </ol>
    </nav>
  );
}

export function ServiceDashboard() {
  const router = useRouter();

  const business = useBusinessStore((s) => s.business);
  const businessStatus = useBusinessStore((s) => s.status);
  const businessError = useBusinessStore((s) => s.error);
  const fetchMine = useBusinessStore((s) => s.fetchMine);

  const services = useServiceStore((s) => s.services);
  const status = useServiceStore((s) => s.status);
  const error = useServiceStore((s) => s.error);
  const notice = useServiceStore((s) => s.notice);
  const removingId = useServiceStore((s) => s.removingId);
  const fetchServices = useServiceStore((s) => s.fetchServices);
  const removeService = useServiceStore((s) => s.removeService);
  const clearNotice = useServiceStore((s) => s.clearNotice);
  const clearError = useServiceStore((s) => s.clearError);
  const reset = useServiceStore((s) => s.reset);

  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceDto | null>(null);
  const [confirmService, setConfirmService] = useState<ServiceDto | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  const businessId = business?.id;

  useEffect(() => {
    void fetchMine();
  }, [fetchMine]);

  useEffect(() => {
    if (businessId) void fetchServices(businessId);
  }, [businessId, fetchServices]);

  useEffect(() => () => reset(), [reset]);

  // Surface list/delete errors as toast when the form is closed.
  useEffect(() => {
    if (error && !formOpen) setToastError(error);
  }, [error, formOpen]);

  const dismissNotice = useCallback(() => clearNotice(), [clearNotice]);
  const dismissToastError = useCallback(() => {
    setToastError(null);
    clearError();
  }, [clearError]);

  if (businessStatus === "idle" || businessStatus === "loading") {
    return <LoadingState />;
  }

  if (businessStatus === "error") {
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-10 sm:py-10">
        <ServicesBreadcrumb />
        <PageHeader
          title="مدیریت خدمات"
          description="برای مدیریت خدمات، ابتدا باید اطلاعات کسب‌وکار شما دریافت شود."
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
        <ServicesBreadcrumb />
        <PageHeader
          title="مدیریت خدمات"
          description="فهرست خدمات، قیمت‌ها و مدت زمان هر خدمت."
        />
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-8 flex flex-col items-center gap-4 rounded-[1.75rem] border border-dashed border-border-strong bg-surface-subtle px-6 py-14 text-center"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Store className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-[17px] font-extrabold text-[#1e1b4b]">
              ابتدا کسب‌وکار خود را ثبت کنید
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 font-medium text-slate-600">
              برای افزودن و مدیریت خدمات، ابتدا باید اطلاعات کسب‌وکار شما تکمیل شده
              باشد.
            </p>
          </div>
          <Button
            size="lg"
            className="h-11 px-6 font-bold"
            onClick={() => router.push("/dashboard/business")}
          >
            ثبت کسب‌وکار
          </Button>
        </motion.div>
      </main>
    );
  }

  const isInitialLoading =
    (status === "idle" || status === "loading") && services.length === 0;

  const openCreate = () => {
    setEditingService(null);
    setFormOpen(true);
  };

  const openEdit = (service: ServiceDto) => {
    setEditingService(service);
    setFormOpen(true);
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-10 sm:py-10">
      <ServicesBreadcrumb />
      <PageHeader
        title="مدیریت خدمات"
        badge={
          status === "loaded" || services.length > 0 ? (
            <span className="inline-flex h-7 items-center rounded-full bg-primary-soft px-2.5 text-[12px] font-bold text-primary tnum">
              {services.length.toLocaleString("fa-IR")} خدمت
            </span>
          ) : null
        }
        description="خدمات مجموعه را تعریف کنید؛ عنوان، قیمت و مدت زمان هر خدمت را مدیریت کنید."
        actions={
          <Button
            size="lg"
            className="h-11 px-5 font-bold"
            onClick={openCreate}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            افزودن خدمت
          </Button>
        }
      />

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mt-6 w-full"
      >
        {isInitialLoading ? (
          <ul
            className="grid grid-cols-1 gap-3 md:grid-cols-2"
            aria-busy="true"
          >
            {[0, 1, 2, 3].map((i) => (
              <li
                key={i}
                className="skeleton-shimmer h-[96px] rounded-2xl bg-surface"
              />
            ))}
          </ul>
        ) : status === "error" && services.length === 0 ? (
          <div className="flex flex-col gap-4 rounded-[1.75rem] border border-border bg-surface p-6 sm:p-8">
            <p className="text-sm leading-6 font-semibold text-slate-600">
              دریافت فهرست خدمات ممکن نشد.
            </p>
            <div>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => businessId && void fetchServices(businessId)}
              >
                تلاش دوباره
              </Button>
            </div>
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-[1.75rem] border border-dashed border-border-strong bg-surface-subtle px-6 py-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-primary-soft text-primary ring-1 ring-primary-subtle ring-inset">
              <Sparkles className="h-7 w-7" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-[17px] font-extrabold text-[#1e1b4b]">
                هنوز خدمتی ثبت نشده است
              </h2>
              <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 font-medium text-slate-600">
                اولین خدمت را اضافه کنید تا در نوبت‌دهی به مشتریان نمایش داده شود.
              </p>
            </div>
            <Button
              size="lg"
              className="h-11 px-6 font-bold"
              onClick={openCreate}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              افزودن خدمت
            </Button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                removing={removingId === service.id}
                onEdit={() => openEdit(service)}
                onRemove={() => setConfirmService(service)}
              />
            ))}
          </ul>
        )}
      </motion.div>

      {businessId && (
        <>
          <ServiceFormDialog
            open={formOpen}
            onOpenChange={(open) => {
              setFormOpen(open);
              if (!open) setEditingService(null);
            }}
            businessId={businessId}
            service={editingService}
          />
          <ConfirmDialog
            open={confirmService !== null}
            onOpenChange={(open) => {
              if (!open) setConfirmService(null);
            }}
            title="حذف خدمت"
            description={
              confirmService
                ? `آیا از حذف «${confirmService.title}» مطمئن هستید؟ در صورت وجود نوبت وابسته، حذف ممکن است انجام نشود.`
                : ""
            }
            confirmLabel="حذف"
            loading={removingId !== null}
            onConfirm={async () => {
              if (!confirmService) return;
              const ok = await removeService(businessId, confirmService.id);
              if (ok) setConfirmService(null);
            }}
          />
        </>
      )}

      <AppToast
        message={notice}
        tone="success"
        onDismiss={dismissNotice}
      />
      <AppToast
        message={formOpen ? null : toastError}
        tone="error"
        onDismiss={dismissToastError}
      />
    </main>
  );
}
