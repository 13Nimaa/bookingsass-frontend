"use client";

import Link from "next/link";
import { Scissors } from "lucide-react";

// Shared brand logo used by the auth pages (login, register, register/business).
// Extracted verbatim — styling and markup are unchanged.
export function AuthLogo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF2FF]">
        <Scissors className="h-5 w-5 text-[#4F46E5]" />
      </div>

      <div>
        <span className="block text-lg font-bold tracking-tight text-[#1e1b4b]">
          BarberCRM
        </span>

        <span className="block text-[11px] text-[#6B7280]">
          مدیریت هوشمند آرایشگاه
        </span>
      </div>
    </Link>
  );
}
