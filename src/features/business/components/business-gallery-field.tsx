"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ImageIcon, Loader2, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useBusinessStore } from "@/features/business/store/business-store";
import {
  BUSINESS_GALLERY_MAX,
  BUSINESS_IMAGE_RULES,
  type BusinessGalleryImageDto,
} from "@/features/business/types";

type LocalItemStatus = "uploading" | "ready" | "error";

type LocalItem = {
  id: string;
  url: string;
  file: File;
  status: LocalItemStatus;
  error?: string;
};

function validateImage(file: File): string | null {
  if (!BUSINESS_IMAGE_RULES.allowedTypes.includes(file.type as never)) {
    return "فرمت تصویر باید JPG، PNG یا WebP باشد.";
  }
  if (file.size > BUSINESS_IMAGE_RULES.maxSize) {
    return "حجم تصویر نباید بیشتر از ۵ مگابایت باشد.";
  }
  return null;
}

interface BusinessGalleryFieldProps {
  disabled?: boolean;
  /**
   * Create/register flow before an owned business exists — keep files local
   * and notify the parent so it can POST /gallery after create.
   */
  deferred?: boolean;
  onDeferredFilesChange?: (files: File[]) => void;
}

export function BusinessGalleryField({
  disabled = false,
  deferred = false,
  onDeferredFilesChange,
}: BusinessGalleryFieldProps) {
  const business = useBusinessStore((s) => s.business);
  const uploadGallery = useBusinessStore((s) => s.uploadGallery);
  const deleteGalleryImage = useBusinessStore((s) => s.deleteGalleryImage);
  const galleryBusy = useBusinessStore((s) => s.galleryBusy);

  const persisted: BusinessGalleryImageDto[] = deferred
    ? []
    : (business?.businessGallery ?? []);

  const [localItems, setLocalItems] = useState<LocalItem[]>([]);
  const [pickerError, setPickerError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ url: string; key: string } | null>(
    null,
  );
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const totalCount = deferred ? localItems.length : persisted.length;
  const atCap = totalCount >= BUSINESS_GALLERY_MAX;
  const uploadingLocal = localItems.some((i) => i.status === "uploading");
  const busy =
    disabled || galleryBusy || uploadingLocal || pendingDeleteId !== null;

  useEffect(() => {
    return () => {
      for (const item of localItems) {
        if (item.url.startsWith("blob:")) URL.revokeObjectURL(item.url);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- revoke only on unmount
  }, []);

  useEffect(() => {
    if (!deferred) return;
    onDeferredFilesChange?.(
      localItems.filter((i) => i.status === "ready").map((i) => i.file),
    );
  }, [deferred, localItems, onDeferredFilesChange]);

  const openPicker = () => {
    if (busy || atCap) return;
    setPickerError(null);
    fileRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (atCap) {
      setPickerError(`حداکثر ${BUSINESS_GALLERY_MAX} تصویر در گالری مجاز است.`);
      return;
    }

    const validationError = validateImage(file);
    if (validationError) {
      setPickerError(validationError);
      return;
    }

    setPickerError(null);
    const id = crypto.randomUUID();
    const url = URL.createObjectURL(file);

    if (deferred) {
      setLocalItems((prev) => [
        ...prev,
        { id, url, file, status: "ready" },
      ]);
      return;
    }

    setLocalItems((prev) => [
      ...prev,
      { id, url, file, status: "uploading" },
    ]);

    void uploadGallery([file]).then((ok) => {
      setLocalItems((prev) => {
        const target = prev.find((i) => i.id === id);
        if (target?.url.startsWith("blob:")) URL.revokeObjectURL(target.url);
        return prev.filter((i) => i.id !== id);
      });
      if (!ok) {
        setPickerError("آپلود تصویر گالری انجام نشد.");
      }
    });
  };

  const removeLocal = (id: string) => {
    setLocalItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.url.startsWith("blob:")) URL.revokeObjectURL(target.url);
      return prev.filter((i) => i.id !== id);
    });
    if (preview?.key === id) setPreview(null);
  };

  const removePersisted = async (publicId: string) => {
    if (busy) return;
    setPendingDeleteId(publicId);
    setPickerError(null);
    const ok = await deleteGalleryImage(publicId);
    setPendingDeleteId(null);
    if (!ok) {
      setPickerError("حذف تصویر گالری انجام نشد.");
      return;
    }
    if (preview?.key === publicId) setPreview(null);
  };

  const showEmpty =
    deferred ? localItems.length === 0 : persisted.length === 0 && localItems.length === 0;

  return (
    <section className="flex flex-col gap-3" aria-labelledby={`${inputId}-heading`}>
      <h3
        id={`${inputId}-heading`}
        className="text-sm font-bold tracking-tight text-[#1e1b4b]"
      >
        گالری تصاویر سالن
      </h3>

      {showEmpty ? (
        <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-dashed border-border bg-surface-secondary/40 px-4 py-6 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-slate-400">
            <ImageIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="text-[13px] font-medium leading-5 text-slate-500">
            هنوز تصویری به گالری اضافه نکرده‌اید
          </p>
          <button
            type="button"
            onClick={openPicker}
            disabled={busy || atCap}
            className="min-h-11 rounded-xl px-4 text-[13px] font-bold text-primary transition-transform duration-100 ease-out hover:text-primary-hover active:scale-[0.97] disabled:opacity-60"
          >
            افزودن تصویر
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-5">
          {!deferred &&
            persisted.map((item) => (
              <li key={item.publicId} className="relative aspect-square">
                <button
                  type="button"
                  onClick={() =>
                    setPreview({ url: item.url, key: item.publicId })
                  }
                  aria-label="مشاهده تصویر بزرگ‌تر"
                  className="group relative h-full w-full overflow-hidden rounded-xl border border-border bg-surface-secondary outline-none transition-transform duration-100 ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  {pendingDeleteId === item.publicId && (
                    <span className="absolute inset-0 flex items-center justify-center bg-[#1e1b4b]/45 backdrop-blur-[1px]">
                      <Loader2
                        className="h-5 w-5 animate-spin text-white"
                        aria-hidden="true"
                      />
                      <span className="sr-only">در حال حذف…</span>
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => void removePersisted(item.publicId)}
                  disabled={busy}
                  aria-label="حذف تصویر از گالری"
                  className="absolute -top-1.5 -start-1.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-slate-500 shadow-sm transition-transform duration-100 ease-out hover:text-error active:scale-[0.94] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}

          {localItems.map((item) => (
            <li key={item.id} className="relative aspect-square">
              <button
                type="button"
                onClick={() =>
                  item.status === "ready"
                    ? setPreview({ url: item.url, key: item.id })
                    : undefined
                }
                disabled={item.status !== "ready"}
                aria-label="مشاهده تصویر بزرگ‌تر"
                className="group relative h-full w-full overflow-hidden rounded-xl border border-border bg-surface-secondary outline-none transition-transform duration-100 ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:active:scale-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {item.status === "uploading" && (
                  <span className="absolute inset-0 flex items-center justify-center bg-[#1e1b4b]/45 backdrop-blur-[1px]">
                    <Loader2
                      className="h-5 w-5 animate-spin text-white"
                      aria-hidden="true"
                    />
                    <span className="sr-only">در حال بارگذاری…</span>
                  </span>
                )}
                {item.status === "error" && (
                  <span
                    role="alert"
                    className="absolute inset-0 flex items-end bg-[#1e1b4b]/55 p-2"
                  >
                    <span className="text-start text-[11px] font-bold leading-4 text-white">
                      {item.error ?? "آپلود ناموفق بود."}
                    </span>
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => removeLocal(item.id)}
                disabled={disabled || item.status === "uploading"}
                aria-label="حذف تصویر از گالری"
                className="absolute -top-1.5 -start-1.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-slate-500 shadow-sm transition-transform duration-100 ease-out hover:text-error active:scale-[0.94] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}

          {!atCap && (
            <li className="aspect-square">
              <button
                type="button"
                onClick={openPicker}
                disabled={busy}
                aria-label="افزودن تصویر به گالری"
                className="flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-surface-secondary/50 text-slate-500 outline-none transition-[transform,background-color,color] duration-100 ease-out hover:bg-surface-secondary hover:text-primary active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
              >
                <Plus className="h-6 w-6" aria-hidden="true" strokeWidth={2.25} />
                <span className="px-1 text-[11px] font-bold leading-4">
                  افزودن تصویر
                </span>
              </button>
            </li>
          )}
        </ul>
      )}

      <input
        ref={fileRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={onFileChange}
        disabled={busy || atCap}
      />

      {pickerError && (
        <p role="alert" className="text-[13px] font-bold leading-5 text-error-text">
          {pickerError}
        </p>
      )}

      <p className="text-[12px] font-medium text-slate-400">
        JPG، PNG یا WebP تا ۵ مگابایت — حداکثر {BUSINESS_GALLERY_MAX} تصویر
      </p>

      <Dialog
        open={!!preview}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
      >
        <DialogContent
          className="max-w-lg overflow-hidden p-3 sm:p-4"
          showClose
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">پیش‌نمایش تصویر گالری</DialogTitle>
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview.url}
              alt="پیش‌نمایش تصویر گالری"
              className="max-h-[70vh] w-full rounded-xl object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
