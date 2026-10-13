"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBusinessStore } from "@/features/business/store/business-store";
import { businessSchema, toBusinessInput, type BusinessFormData } from "@/features/business/schemas/business.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthError } from "@/components/shared/auth-error";
import type { BusinessDto, BusinessInput } from "@/features/business/types";

interface BusinessFormProps {
  mode: "create" | "edit";
  initial?: BusinessDto | null;
  onDone: () => void;
  onCancel?: () => void;
  // Optional submit override (e.g. post-registration business creation goes
  // to the register endpoint instead of the dashboard CRUD endpoints).
  // Defaults to the business-store actions, so existing usages are unchanged.
  submit?: (input: BusinessInput) => Promise<boolean>;
}

export function BusinessForm({ mode, initial, onDone, onCancel, submit }: BusinessFormProps) {
  const create = useBusinessStore((s) => s.create);
  const update = useBusinessStore((s) => s.update);
  const error = useBusinessStore((s) => s.error);
  const clearError = useBusinessStore((s) => s.clearError);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: initial
      ? {
          name: initial.name,
          city: initial.city,
          address: initial.address,
          description: initial.description ?? "",
        }
      : undefined,
  });

  const onSubmit = async (data: BusinessFormData) => {
    const input = toBusinessInput(data);
    const ok = submit
      ? await submit(input)
      : mode === "create"
        ? await create(input)
        : await update(input);
    if (ok) onDone();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {error && <AuthError ref={errorRef} message={error} />}

      <Input
        id="business-name"
        label="نام کسب‌وکار"
        aria-invalid={!!errors.name}
        autoComplete="organization"
        placeholder="مثلاً سالن زیبایی آرتا"
        error={errors.name?.message}
        {...register("name")}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id="business-city"
          label="شهر"
          aria-invalid={!!errors.city}
          autoComplete="address-level2"
          placeholder="مثلاً تهران"
          error={errors.city?.message}
          {...register("city")}
        />

        <Input
          id="business-address"
          label="نشانی"
          aria-invalid={!!errors.address}
          autoComplete="street-address"
          placeholder="مثلاً خیابان ولیعصر، پلاک ۱۲"
          error={errors.address?.message}
          {...register("address")}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="business-description" className="block text-sm font-bold text-[#1e1b4b]">
          توضیحات <span className="font-medium text-slate-400">(اختیاری)</span>
        </label>
        <textarea
          id="business-description"
          rows={4}
          aria-invalid={!!errors.description}
          className={`
            w-full
            rounded-xl
            border
            px-4 py-3
            text-[15px]
            font-medium
            shadow-[0_1px_2px_rgba(79,70,229,0.08)]
            outline-none
            transition-all duration-200
            ${
              errors.description
                ? "border-error bg-surface text-[#1e1b4b] placeholder:text-slate-400 focus:border-error focus:bg-surface focus:ring-4 focus:ring-error-soft"
                : "border-border bg-surface text-[#1e1b4b] placeholder:text-slate-400 hover:border-border-strong focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary-soft"
            }
          `}
          placeholder="چند خط درباره‌ی کسب‌وکار، خدمات و فضای آن..."
          {...register("description")}
        />
        {errors.description && (
          <p className="text-[13px] leading-5 font-bold text-error-text">{errors.description.message}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" className="h-11 px-6 text-[15px] font-bold" disabled={isSubmitting}>
          {isSubmitting
            ? "در حال ذخیره..."
            : mode === "create"
              ? "ایجاد کسب‌وکار"
              : "ذخیره تغییرات"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={() => { clearError(); onCancel(); }}>
            انصراف
          </Button>
        )}
      </div>
    </form>
  );
}
