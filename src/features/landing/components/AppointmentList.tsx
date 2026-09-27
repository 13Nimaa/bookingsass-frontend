type AppointmentStatus = "confirmed" | "waiting" | "in-progress";

const STATUS_STYLES: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  confirmed: {
    label: "تأیید شده",
    className: "border-success-border bg-success-soft text-success-text",
  },
  waiting: {
    label: "در انتظار",
    className: "border-warning-border bg-warning-soft text-warning-text",
  },
  "in-progress": {
    label: "در حال انجام",
    className: "border-info-border bg-info-soft text-info-text",
  },
};

interface ShowcaseAppointment {
  name: string;
  service: string;
  employee: string;
  time: string;
  status: AppointmentStatus;
}

const APPOINTMENTS: ShowcaseAppointment[] = [
  {
    name: "امیر رضایی",
    service: "اصلاح مو + ریش",
    employee: "علی",
    time: "۱۰:۳۰",
    status: "confirmed",
  },
  {
    name: "محمد کریمی",
    service: "اصلاح مو",
    employee: "رضا",
    time: "۱۱:۱۵",
    status: "waiting",
  },
  {
    name: "سینا احمدی",
    service: "فید + ریش",
    employee: "علی",
    time: "۱۲:۰۰",
    status: "confirmed",
  },
  {
    name: "پارسا نادری",
    service: "رنگ مو",
    employee: "مهدی",
    time: "۱۴:۳۰",
    status: "in-progress",
  },
];

function AppointmentItem({ appointment }: { appointment: ShowcaseAppointment }) {
  const { name, service, employee, time, status } = appointment;
  const style = STATUS_STYLES[status];
  const initial = name.trim().split(/\s+/)[0].charAt(0);

  return (
    <div className="flex items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white"
      >
        {initial}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium leading-5 text-text-primary sm:text-[13px]">
          {name}
        </p>
        <p className="truncate text-[11px] leading-4 text-muted">
          {service}
          <span className="sm:hidden"> · {employee}</span>
        </p>
      </div>

      <span
        aria-hidden="true"
        className="hidden w-10 shrink-0 truncate text-[11px] leading-4 text-muted sm:inline-block"
      >
        {employee}
      </span>

      <span className="shrink-0 text-[11px] font-medium leading-4 text-text-secondary tabular-nums sm:text-xs">
        {time}
      </span>

      <span
        className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium leading-4 sm:text-[11px] ${style.className}`}
      >
        {style.label}
      </span>
    </div>
  );
}

export function AppointmentList() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5 sm:px-4">
        <h3 className="text-[13px] font-semibold leading-5 text-text-primary sm:text-sm">
          نوبت‌های امروز
        </h3>
        <p className="text-[11px] leading-4 text-muted">۴ نوبت</p>
      </div>

      <div className="divide-y divide-border">
        {APPOINTMENTS.map((appointment) => (
          <AppointmentItem
            key={appointment.name}
            appointment={appointment}
          />
        ))}
      </div>

      <div className="mt-auto border-t border-border px-3 py-2.5 text-center text-[11px] font-medium leading-4 text-primary sm:px-4">
        مشاهده همه نوبت‌ها
      </div>
    </div>
  );
}
