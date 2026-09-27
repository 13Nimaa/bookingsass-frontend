import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
}

export function StatCard({ label, value, hint, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-[11px] font-medium leading-5 text-muted sm:text-xs">
          {label}
        </p>
        <span
          aria-hidden="true"
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-soft to-primary-subtle text-primary sm:flex lg:h-9 lg:w-9"
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>
      <p className="mt-1 text-[13px] font-semibold leading-6 text-text-primary sm:text-sm">
        {value}
      </p>
      {hint && (
        <p className="mt-0.5 text-[11px] font-medium leading-4 text-success">
          {hint}
        </p>
      )}
    </div>
  );
}
