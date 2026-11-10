"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration, formatPrice } from "@/features/employee/lib/format";
import type { EmployeeServiceDto } from "@/features/employee/types";

const CUSTOM_CHIP =
  "rounded-md bg-success-soft px-1.5 py-0.5 text-[10.5px] leading-4 font-bold text-success-text";
const DEFAULT_CHIP =
  "rounded-md bg-surface-secondary px-1.5 py-0.5 text-[10.5px] leading-4 font-bold text-muted";

/**
 * One effective-value cell (price or duration). The override flag decides
 * the state: a non-null override shows a "custom" chip plus the service
 * default as secondary info; a null override shows the default chip. The
 * effective value itself is always shown prominently.
 */
function EffectiveValueCell({
  label,
  value,
  custom,
  customChipLabel,
  defaultChipLabel,
  defaultValueLabel,
}: {
  label: string;
  value: string;
  custom: boolean;
  customChipLabel: string;
  defaultChipLabel: string;
  defaultValueLabel: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-xl border border-border-subtle bg-surface-subtle p-3">
      <span className="text-[11px] leading-4 font-bold text-muted">{label}</span>
      <span className="tnum text-[15px] leading-6 font-extrabold text-text-primary">
        {value}
      </span>
      {custom ? (
        <>
          <span className={CUSTOM_CHIP}>{customChipLabel}</span>
          <span className="tnum text-[11px] leading-4 font-medium text-text-disabled">
            پیش‌فرض خدمت: {defaultValueLabel}
          </span>
        </>
      ) : (
        <span className={DEFAULT_CHIP}>{defaultChipLabel}</span>
      )}
    </div>
  );
}

export function EmployeeServiceCard({
  service,
  onEdit,
  onRemove,
}: {
  service: EmployeeServiceDto;
  onEdit?: (service: EmployeeServiceDto) => void;
  onRemove?: (service: EmployeeServiceDto) => void;
}) {
  const title = service.title;
  const customPrice = service.priceOverride != null;
  const customDuration = service.durationMinutesOverride != null;

  return (
    <li className="rounded-2xl border border-border bg-surface p-4 transition-[border-color,box-shadow] duration-150 hover:border-border-strong hover:shadow-[0_14px_30px_-24px_rgba(30,27,75,0.5)] motion-reduce:transition-none">
      <div className="flex items-start justify-between gap-2">
        <p
          className="min-w-0 truncate pt-0.5 text-[14.5px] leading-6 font-extrabold text-text-primary"
          title={title}
        >
          {title}
        </p>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`ویرایش ${title}`}
            className="h-9 w-9 rounded-lg text-muted transition-colors hover:bg-primary-soft hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={onEdit ? () => onEdit(service) : undefined}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`حذف ${title}`}
            className="h-9 w-9 rounded-lg text-muted transition-colors hover:bg-error-soft hover:text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
            onClick={onRemove ? () => onRemove(service) : undefined}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="mt-3 grid min-w-0 grid-cols-1 gap-2 min-[380px]:grid-cols-2">
        <EffectiveValueCell
          label="قیمت هر نوبت"
          value={formatPrice(service.effectivePrice)}
          custom={customPrice}
          customChipLabel="مبلغ اختصاصی کارمند"
          defaultChipLabel="مبلغ پیش‌فرض خدمت"
          defaultValueLabel={formatPrice(service.defaultPrice)}
        />
        <EffectiveValueCell
          label="مدت زمان"
          value={formatDuration(service.effectiveDurationMinutes)}
          custom={customDuration}
          customChipLabel="مدت اختصاصی کارمند"
          defaultChipLabel="مدت پیش‌فرض خدمت"
          defaultValueLabel={formatDuration(service.defaultDurationMinutes)}
        />
      </div>
    </li>
  );
}
