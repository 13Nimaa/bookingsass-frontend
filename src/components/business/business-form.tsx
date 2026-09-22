"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBusinessStore } from "@/store/business-store";
import { businessSchema, toBusinessInput, type BusinessFormData } from "@/lib/business-validations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthError } from "@/components/ui/auth-error";
import type { BusinessDto } from "@/types/business";

interface BusinessFormProps {
  mode: "create" | "edit";
  initial?: BusinessDto | null;
  onDone: () => void;
  onCancel?: () => void;
}

export function BusinessForm({ mode, initial, onDone, onCancel }: BusinessFormProps) {
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
    const ok = mode === "create" ? await create(input) : await update(input);
    if (ok) onDone();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {error && <AuthError ref={errorRef} message={error} />}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="business-name" className="text-sm font-medium text-foreground">
          نام کسب‌وکار
        </label>
        <Input
          id="business-name"
          aria-invalid={!!errors.name}
          autoComplete="organization"
          placeholder="مثلاً سالن زیبایی آرتا"
          {...register("name")}
        />
        {errors.name && <p className="text-xs text-error">{errors.name.message}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="business-city" className="text-sm font-medium text-foreground">
            شهر
          </label>
          <Input
            id="business-city"
            aria-invalid={!!errors.city}
            autoComplete="address-level2"
            placeholder="مثلاً تهران"
            {...register("city")}
          />
          {errors.city && <p className="text-xs text-error">{errors.city.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="business-address" className="text-sm font-medium text-foreground">
            نشانی
          </label>
          <Input
            id="business-address"
            aria-invalid={!!errors.address}
            autoComplete="street-address"
            placeholder="مثلاً خیابان ولیعصر، پلاک ۱۲"
            {...register("address")}
          />
          {errors.address && <p className="text-xs text-error">{errors.address.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="business-description" className="text-sm font-medium text-foreground">
          توضیحات <span className="font-normal text-muted">(اختیاری)</span>
        </label>
        <textarea
          id="business-description"
          rows={4}
          aria-invalid={!!errors.description}
          className="w-full rounded-md border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-border"
          placeholder="چند خط درباره‌ی کسب‌وکار، خدمات و فضای آن..."
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-error">{errors.description.message}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
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
