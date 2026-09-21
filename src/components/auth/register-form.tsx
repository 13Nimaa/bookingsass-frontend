"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/auth-store";
import { registerSchema, type RegisterFormData } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrength } from "@/components/ui/password-strength";
import { Button } from "@/components/ui/button";
import { AuthError } from "@/components/ui/auth-error";
import { AuthDivider } from "@/components/ui/auth-divider";

export function RegisterForm() {
  const registerUser = useAuthStore((s) => s.register);
  const authError = useAuthStore((s) => s.error);
  const status = useAuthStore((s) => s.status);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authError) errorRef.current?.focus();
  }, [authError]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const password = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    const ok = await registerUser(data.name, data.email, data.password, data.confirmPassword);
    if (ok) window.location.assign("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {authError && <AuthError ref={errorRef} message={authError} />}

      <Input
        label="نام"
        autoComplete="name"
        placeholder="مثلاً علی رضایی"
        error={errors.name?.message}
        {...register("name")}
      />

      <Input
        label="ایمیل"
        type="email"
        autoComplete="email"
        dir="ltr"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <div className="flex flex-col gap-2">
        <PasswordInput
          label="رمز عبور"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordStrength password={password ?? ""} />
      </div>

      <PasswordInput
        label="تکرار رمز عبور"
        autoComplete="new-password"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Button type="submit" loading={status === "loading"} loadingText="در حال ثبت‌نام...">
        ایجاد حساب کاربری
      </Button>

      <AuthDivider />
      <p className="text-center text-sm text-muted">
        قبلاً ثبت‌نام کرده‌اید؟{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          وارد شوید
        </Link>
      </p>
    </form>
  );
}
