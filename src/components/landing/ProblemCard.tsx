import type { LucideIcon } from "lucide-react";

interface ProblemCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function ProblemCard({
  title,
  description,
  icon: Icon,
}: ProblemCardProps) {
  return (
    <div className="group h-full rounded-xl border border-border bg-surface p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-border-strong hover:shadow-md motion-reduce:hover:translate-y-0 motion-reduce:transition-none sm:p-6">
      <span
        aria-hidden="true"
        className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-primary-soft text-primary transition-transform duration-200 group-hover:scale-110 motion-reduce:group-hover:scale-100"
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </span>
      <h3 className="mt-4 text-base font-semibold leading-7 text-text-primary">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-7 text-text-secondary">{description}</p>
    </div>
  );
}
