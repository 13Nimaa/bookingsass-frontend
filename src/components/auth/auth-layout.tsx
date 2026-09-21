import { CalendarCheck } from "lucide-react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-full flex-1 flex-col lg:flex-row">
      {/* Brand panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-primary p-12 text-white">
        <div className="flex items-center gap-2 text-xl font-semibold">
          <CalendarCheck size={28} />
          BookFlow
        </div>
        <div className="max-w-md">
          <h1 className="text-3xl font-bold leading-tight">
            مدیریت رزرو، بدون دردسر.
          </h1>
          <p className="mt-4 text-white/80">
            زمان‌بندی نوبت‌ها، مدیریت مشتریان و همگام‌سازی تقویم — همه در یک مکان.
          </p>
        </div>
        <p className="text-sm text-white/60">© 2026 BookFlow</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
              <CalendarCheck size={22} />
              BookFlow
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="mt-1 mb-6 text-sm text-muted">{subtitle}</p>
          {children}
        </div>
      </div>
    </main>
  );
}
