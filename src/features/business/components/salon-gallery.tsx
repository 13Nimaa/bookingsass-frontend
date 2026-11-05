"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { cn } from "cn";

interface SalonGalleryProps {
  images: string[];
  salonName: string;
  className?: string;
}

export function SalonGallery({ images, salonName, className }: SalonGalleryProps) {
  const imagesKey = images.join("|");
  const [index, setIndex] = React.useState(0);
  const [failed, setFailed] = React.useState<Record<number, boolean>>({});
  const [seenKey, setSeenKey] = React.useState(imagesKey);

  if (seenKey !== imagesKey) {
    setSeenKey(imagesKey);
    setIndex(0);
    setFailed({});
  }

  const usable = images.filter((url, i) => Boolean(url) && !failed[i]);
  const activeIndex = Math.min(index, Math.max(usable.length - 1, 0));
  const active = usable[activeIndex] ?? null;

  if (!active) {
    return (
      <div
        className={cn(
          "flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-[1.25rem] border border-border bg-surface-secondary text-muted/60",
          className,
        )}
      >
        <ImageOff className="h-9 w-9" aria-hidden="true" />
        <span className="text-[13px] font-medium">بدون تصویر</span>
      </div>
    );
  }

  const go = (delta: number) => {
    if (usable.length <= 1) return;
    setIndex((current) => (current + delta + usable.length) % usable.length);
  };

  return (
    <div className={cn("relative overflow-hidden rounded-[1.25rem]", className)}>
      <div className="relative aspect-[4/3] w-full bg-surface-secondary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={active}
          alt={salonName}
          className="h-full w-full object-cover"
          onError={() => {
            const sourceIndex = images.indexOf(active);
            if (sourceIndex >= 0) {
              setFailed((prev) => ({ ...prev, [sourceIndex]: true }));
            }
          }}
        />

        {usable.length > 1 ? (
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-3">
            <button
              type="button"
              aria-label="تصویر قبلی"
              onClick={() => go(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-surface/95 text-text-primary shadow-sm transition-colors hover:bg-surface"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <span className="rounded-full bg-surface/95 px-2.5 py-1 text-[12px] font-bold tabular-nums text-text-primary shadow-sm">
              {(activeIndex + 1).toLocaleString("fa-IR")}/
              {usable.length.toLocaleString("fa-IR")}
            </span>
            <button
              type="button"
              aria-label="تصویر بعدی"
              onClick={() => go(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-surface/95 text-text-primary shadow-sm transition-colors hover:bg-surface"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ) : null}
      </div>

      {usable.length > 1 ? (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {usable.slice(0, 3).map((url, thumbIndex) => (
            <button
              key={`${url}-${thumbIndex}`}
              type="button"
              onClick={() => setIndex(thumbIndex)}
              aria-label={`تصویر ${thumbIndex + 1}`}
              aria-pressed={thumbIndex === activeIndex}
              className={cn(
                "aspect-[4/3] overflow-hidden rounded-xl border bg-surface-secondary transition-colors",
                thumbIndex === activeIndex
                  ? "border-primary ring-2 ring-primary-soft"
                  : "border-border hover:border-border-strong",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
