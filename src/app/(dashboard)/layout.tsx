import { AuthGuard } from "@/features/auth/components/auth-guard";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-full flex-1 flex-col md:flex-row">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </AuthGuard>
  );
}
