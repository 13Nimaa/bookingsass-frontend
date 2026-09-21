"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/auth-store";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { AuthError } from "@/components/ui/auth-error";
import { AuthDivider } from "@/components/ui/auth-divider";

export function LoginForm() {
  const login = useAuthStore((s) => s.login);
  const authError = useAuthStore((s) => s.error);
  const status = useAuthStore((s) => s.status);
  const errorRef = useRef<HTMLDivElement>(null);

  // Move focus to the error alert when it appears (a11y: announce + keyboard reachability)
  useEffect(() => {
    if (authError) errorRef.current?.focus();
  }, [authError]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData) => {
    const ok = await login(data.email, data.password);
    if (ok) {
      // Only relative paths — prevents open redirect via ?redirect=https://evil.com
      const redirect = new URLSearchParams(window.location.search).get("redirect");
      const target =
        redirect && redirect.startsWith("/") && !redirect.startsWith("//")
          ? redirect
          : "/dashboard";
      window.location.assign(target);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {authError && <AuthError ref={errorRef} message={authError} />}

      <Input
        label="ایمیل"
        type="email"
        autoComplete="email"
        dir="ltr"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <PasswordInput
        label="رمز عبور"
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register("password")}
      />

      <Button type="submit" loading={status === "loading"} loadingText="در حال ورود...">
        ورود
      </Button>

      <AuthDivider />
      <p className="text-center text-sm text-muted">
        حساب کاربری ندارید؟{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          ثبت‌نام کنید
        </Link>
      </p>
    </form>
  );
}
