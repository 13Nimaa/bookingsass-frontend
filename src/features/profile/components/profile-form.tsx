"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProfileStore } from "@/features/profile/store/profile-store";
import type { UserProfile } from "@/features/profile/types";
import {
  profileSchema,
  toUpdateProfileInput,
  type ProfileFormData,
} from "@/features/profile/schemas/profile.schema";

export function ProfileForm({
  profile,
  onDone,
  onCancel,
}: {
  profile: UserProfile;
  onDone: () => void;
  onCancel: () => void;
}) {
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const saving = useProfileStore((s) => s.saving);
  const clearError = useProfileStore((s) => s.clearError);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.fullName,
      email: profile.email ?? "",
    },
  });

  // Re-seed when a fresh profile arrives (e.g. after refetch).
  useEffect(() => {
    reset({ fullName: profile.fullName, email: profile.email ?? "" });
  }, [profile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    const ok = await updateProfile(toUpdateProfileInput(data));
    if (ok) onDone();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <Input
        id="profile-fullname"
        label="نام و نام خانوادگی"
        autoComplete="name"
        placeholder="مثلاً سارا محمدی"
        disabled={saving}
        aria-invalid={!!errors.fullName}
        error={errors.fullName?.message}
        {...register("fullName")}
      />

      <Input
        id="profile-email"
        label="ایمیل"
        type="email"
        dir="ltr"
        autoComplete="email"
        placeholder="you@example.com"
        disabled={saving}
        aria-invalid={!!errors.email}
        error={errors.email?.message}
        hint="اختیاری — برای اطلاع‌رسانی‌ها استفاده می‌شود."
        {...register("email")}
      />

      {/* Phone is identity (UserName) — read-only, managed by the backend. */}
      <Input
        id="profile-phone"
        label="شماره موبایل"
        dir="ltr"
        autoComplete="tel"
        value={profile.phoneNumber ?? "—"}
        disabled
        hint="شماره موبایل شناسه ورود شماست و قابل تغییر نیست."
      />

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" size="lg" className="h-11 px-6" disabled={saving || !isDirty}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              در حال ذخیره...
            </>
          ) : (
            "ذخیره تغییرات"
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={saving}
          onClick={() => {
            clearError();
            reset();
            onCancel();
          }}
        >
          انصراف
        </Button>
      </div>
    </form>
  );
}
