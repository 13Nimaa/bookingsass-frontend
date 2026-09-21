"use client";

import { LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <main className="flex flex-1 flex-col p-6 sm:p-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {user ? `سلام، ${user.name}` : "سلام"}
          </h1>
          <p className="text-sm text-muted">وارد BookFlow شده‌اید.</p>
        </div>
        <Button variant="secondary" onClick={() => void logout()}>
          <LogOut size={16} />
          خروج
        </Button>
      </header>
    </main>
  );
}
