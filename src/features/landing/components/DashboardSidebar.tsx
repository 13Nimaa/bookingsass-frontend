import {
  CalendarDays,
  ChartColumn,
  LayoutDashboard,
  Settings,
  Sparkles,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "داشبورد", icon: LayoutDashboard, active: true },
  { label: "نوبت‌ها", icon: CalendarDays },
  { label: "مشتریان", icon: Users },
  { label: "خدمات", icon: Sparkles },
  { label: "کارکنان", icon: UserRound },
  { label: "پرداخت‌ها", icon: Wallet },
  { label: "گزارش‌ها", icon: ChartColumn },
];

interface DashboardSidebarProps {
  variant?: "aside" | "top";
}

export function DashboardSidebar({ variant = "aside" }: DashboardSidebarProps) {
  if (variant === "top") {
    return (
      <div
        aria-hidden="true"
        className="flex items-center justify-between border-b border-border bg-surface px-3 py-2 sm:hidden"
      >
        {NAV_ITEMS.map(({ label, icon: Icon, active }) => (
          <span
            key={label}
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              active ? "bg-primary/10 text-primary" : "text-muted"
            }`}
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
          </span>
        ))}
      </div>
    );
  }

  return (
    <aside
      aria-hidden="true"
      className="hidden shrink-0 flex-col gap-1 border-e border-border bg-surface px-2 py-3 sm:flex lg:w-48 lg:px-3"
    >
      <div className="mb-2 hidden items-center gap-2 px-2 lg:flex">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-white">
          B
        </span>
        <span className="text-sm font-semibold text-text-primary">
          BarberCRM
        </span>
      </div>

      {NAV_ITEMS.map(({ label, icon: Icon, active }) => (
        <span
          key={label}
          className={`flex items-center justify-center gap-2 rounded-lg px-2 py-2 lg:justify-start lg:px-2.5 ${
            active ? "bg-primary/10 font-medium text-primary" : "text-muted"
          }`}
        >
          <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
          <span className="hidden text-[13px] lg:inline">{label}</span>
        </span>
      ))}

      <span className="mt-auto flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-muted lg:justify-start lg:px-2.5">
        <Settings className="h-4 w-4 shrink-0" strokeWidth={2} />
        <span className="hidden text-[13px] lg:inline">تنظیمات</span>
      </span>
    </aside>
  );
}
