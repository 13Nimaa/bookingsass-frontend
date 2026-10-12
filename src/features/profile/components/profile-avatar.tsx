"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Trash2, UserRound } from "lucide-react";
import { useProfileStore } from "@/features/profile/store/profile-store";
import { PROFILE_IMAGE_RULES } from "@/features/profile/types";

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "؟";
  return parts.map((p) => p[0]).join("");
}

export function ProfileAvatar({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl: string | null;
}) {
  const uploading = useProfileStore((s) => s.uploading);
  const uploadImage = useProfileStore((s) => s.uploadImage);
  const deleteImage = useProfileStore((s) => s.deleteImage);
  const [localError, setLocalError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const pickFile = () => {
    setLocalError(null);
    fileRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!PROFILE_IMAGE_RULES.allowedTypes.includes(file.type as never)) {
      setLocalError("فرمت تصویر باید JPG، PNG یا WebP باشد.");
      return;
    }
    if (file.size > PROFILE_IMAGE_RULES.maxSize) {
      setLocalError("حجم تصویر نباید بیشتر از ۵ مگابایت باشد.");
      return;
    }
    setLocalError(null);
    await uploadImage(file);
  };

  const onDelete = async () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setConfirmingDelete(false);
    await deleteImage();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {/* Ring + avatar */}
        <div className="rounded-full bg-gradient-to-bl from-primary via-primary-pressed to-premium p-1 shadow-lg shadow-primary/20">
          <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-surface sm:h-28 sm:w-28">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={`تصویر پروفایل ${name}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex h-full w-full items-center justify-center bg-primary-soft text-3xl font-bold text-primary"
              >
                {initialsOf(name)}
              </span>
            )}

            {/* Uploading veil */}
            {uploading && (
              <span className="absolute inset-0 flex items-center justify-center bg-foreground/45 backdrop-blur-[1px]">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </span>
            )}
          </div>
        </div>

        {/* Camera button */}
        <button
          type="button"
          onClick={pickFile}
          disabled={uploading}
          aria-label="تغییر تصویر پروفایل"
          title="تغییر تصویر پروفایل"
          className="absolute -bottom-1 -left-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-surface bg-primary text-primary-foreground shadow-md transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
          onChange={onFileChange}
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={pickFile}
          disabled={uploading}
          className="text-xs font-medium text-primary transition hover:text-primary-hover disabled:opacity-60"
        >
          {imageUrl ? "تغییر تصویر" : "افزودن تصویر"}
        </button>
        {imageUrl && (
          <>
            <span aria-hidden="true" className="text-border-strong">
              •
            </span>
            <button
              type="button"
              onClick={onDelete}
              onBlur={() => setConfirmingDelete(false)}
              disabled={uploading}
              className={`flex items-center gap-1 text-xs font-medium transition disabled:opacity-60 ${
                confirmingDelete
                  ? "text-error hover:text-error-text"
                  : "text-muted hover:text-error"
              }`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {confirmingDelete ? "برای حذف کلیک کنید" : "حذف"}
            </button>
          </>
        )}
      </div>

      {localError && (
        <p role="alert" className="max-w-60 text-center text-xs font-medium text-error-text">
          {localError}
        </p>
      )}
      {!imageUrl && !localError && (
        <p className="flex items-center gap-1 text-[11px] text-text-disabled">
          <UserRound className="h-3 w-3" />
          JPG، PNG یا WebP تا ۵ مگابایت
        </p>
      )}
    </div>
  );
}
