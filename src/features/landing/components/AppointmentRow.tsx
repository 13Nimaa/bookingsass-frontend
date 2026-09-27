export type AppointmentStatus = "confirmed" | "in-progress" | "waiting";

const STATUS_STYLES: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  confirmed: {
    label: "تایید شده",
    className: "border-success-border bg-success-soft text-success-text",
  },
  "in-progress": {
    label: "در حال انجام",
    className: "border-info-border bg-info-soft text-info-text",
  },
  waiting: {
    label: "منتظر",
    className: "border-warning-border bg-warning-soft text-warning-text",
  },
};

interface AppointmentRowProps {
  name: string;
  service: string;
  time: string;
  status: AppointmentStatus;
}

export function AppointmentRow({
  name,
  service,
  time,
  status,
}: AppointmentRowProps) {
  const style = STATUS_STYLES[status];
  const initial = name.trim().split(/\s+/)[0].charAt(0);

  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 sm:gap-3 sm:px-4">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#6366f1] text-xs font-semibold text-white shadow-sm"
      >
        {initial}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium leading-5 text-text-primary sm:text-[13px]">
          {name}
        </p>
        <p className="truncate text-[11px] leading-4 text-muted">
          {time} · {service}
        </p>
      </div>

      <span
        className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium leading-4 sm:text-[11px] ${style.className}`}
      >
        {style.label}
      </span>
    </div>
  );
}
