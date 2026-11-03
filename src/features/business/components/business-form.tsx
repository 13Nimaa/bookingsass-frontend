"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBusinessStore } from "@/features/business/store/business-store";
import { businessSchema, toBusinessInput, type BusinessFormData } from "@/features/business/schemas/business.schema";
import { BusinessImageField } from "@/features/business/components/business-image-field";
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
  const uploadImage = useBusinessStore((s) => s.uploadImage);
  const deleteImage = useBusinessStore((s) => s.deleteImage);
  const uploading = useBusinessStore((s) => s.uploading);
  const error = useBusinessStore((s) => s.error);
  const clearError = useBusinessStore((s) => s.clearError);
  const errorRef = useRef<HTMLDivElement>(null);

  // For the create/upgrade flow the business does not exist yet, so the image
  // endpoint would 404. We keep the picked file locally, show a preview, and
  // upload it only after the business has been created. In edit mode the
  // business already exists, so uploads happen immediately (like the profile).
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const {
    register,
    handleSubmit,
    control,
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

  const business = useBusinessStore((s) => s.business);
  const watchedName = useWatch({ control, name: "name" });
  const nameValue = watchedName ?? initial?.name ?? "";
  const displayImageUrl =
    mode === "edit" ? business?.profileImageUrl ?? null : previewUrl;
  const canRemoveImage =
    mode === "edit" ? !!business?.profileImageUrl : !!previewUrl;

  const handleImageSelect = (file: File) => {
    if (mode === "edit") {
      void uploadImage(file);
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setPendingImage(file);
  };

  const handleImageRemove = () => {
    if (mode === "edit") {
      void deleteImage();
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingImage(null);
  };

  const onSubmit = async (data: BusinessFormData) => {
    const input = toBusinessInput(data);
    const ok = submit
      ? await submit(input)
      : mode === "create"
        ? await create(input)
        : await update(input);
    if (!ok) return;

    if (mode === "create" && pendingImage) {
      const store = useBusinessStore.getState();
      if (!store.business) await store.fetchMine();
      if (useBusinessStore.getState().business) {
        await useBusinessStore.getState().uploadImage(pendingImage);
      }
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPendingImage(null);
    }

    onDone();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {error && <AuthError ref={errorRef} message={error} />}

      <BusinessImageField
        name={nameValue}
        imageUrl={displayImageUrl}
        uploading={uploading}
        disabled={isSubmitting}
        canRemove={canRemoveImage}
        onSelect={handleImageSelect}
        onRemove={handleImageRemove}
      />

      <Input
        id="business-name"
        label="نام سالن"
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
          placeholder="چند خط درباره‌ی سالن، خدمات و فضای آن..."
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
              ? "ایجاد سالن"
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
