"use client";

import { useMemo } from "react";

const LEVELS = [
  { label: "ضعیف", color: "bg-error" },
  { label: "متوسط", color: "bg-warning" },
  { label: "خوب", color: "bg-primary" },
  { label: "قوی", color: "bg-success" },
] as const;

function score(password: string): number {
  if (!password) return 0;
  let s = 0;
  if (password.length >= 8) s++;
  if (password.length >= 12) s++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password)) s++;
  if (/[^A-Za-z0-9]/.test(password)) s++;
  return Math.min(s, 4); // 1-4 while typing
}

export function PasswordStrength({ password }: { password: string }) {
  const value = useMemo(() => score(password), [password]);
  if (!password) return null;

  const level = LEVELS[value - 1];

  return (
    <div className="flex flex-col gap-1" aria-live="polite">
      <div className="flex gap-1">
        {LEVELS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors motion-reduce:transition-none ${
              i < value ? level.color : "bg-border"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-muted">استحکام رمز عبور: {level.label}</span>
    </div>
  );
}
