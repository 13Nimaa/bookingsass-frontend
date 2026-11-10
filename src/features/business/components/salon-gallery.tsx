"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Grid2x2, ImageOff, X } from "lucide-react";
import { cn } from "cn";

interface SalonGalleryProps {
  images: string[];
  salonName: string;
  className?: string;
}

function GalleryImage({
  src,
  alt,
  className,
  onError,
}: {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn("h-full w-full object-cover", className)}
      onError={onError}
    />
  );
}

export function SalonGallery({
  images,
  salonName,
  className,
}: SalonGalleryProps) {
  const reduceMotion = useReducedMotion();
  const imagesKey = images.join("|");
  const [failed, setFailed] = React.useState<Record<number, boolean>>({});
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [lightboxIndex, setLightboxIndex] = React.useState(0);
  const [seenKey, setSeenKey] = React.useState(imagesKey);

  if (seenKey !== imagesKey) {
    setSeenKey(imagesKey);
    setFailed({});
    setLightboxOpen(false);
    setLightboxIndex(0);
  }

  const usable = images
    .map((url, i) => ({ url, i }))
    .filter(({ url, i }) => Boolean(url) && !failed[i]);

  const markFailed = (sourceIndex: number) => {
    setFailed((prev) => ({ ...prev, [sourceIndex]: true }));
  };

  React.useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft" && usable.length > 1) {
        setLightboxIndex((i) => (i + 1) % usable.length);
      }
      if (e.key === "ArrowRight" && usable.length > 1) {
        setLightboxIndex((i) => (i - 1 + usable.length) % usable.length);
      }
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightboxOpen, usable.length]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (usable.length === 0) {
    return (
      <div
        className={cn(
          "flex h-[280px] w-full flex-col items-center justify-center gap-2 rounded-2xl bg-surface-secondary text-muted/60 sm:h-[360px] lg:h-[420px]",
          className,
        )}
      >
        <ImageOff className="h-9 w-9" aria-hidden="true" />
        <span className="text-[13px] font-medium">بدون تصویر</span>
      </div>
    );
  }

  const primary = usable[0]!;
  const sideA = usable[1];
  const sideB = usable[2];
  const hasMosaic = usable.length >= 2;

  return (
    <>
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl bg-surface-secondary",
          className,
        )}
      >
        {/* Full-bleed mosaic — Airbnb / screenshot layout */}
        <div
          className={cn(
            "grid h-[280px] gap-1.5 sm:h-[360px] sm:gap-2 lg:h-[440px]",
            hasMosaic
              ? "grid-cols-1 sm:grid-cols-[1.65fr_1fr]"
              : "grid-cols-1",
          )}
        >
          <button
            type="button"
            onClick={() => openLightbox(0)}
            className={cn(
              "group relative h-full min-h-0 cursor-pointer overflow-hidden bg-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
            )}
          >
            <GalleryImage
              src={primary.url}
              alt={salonName}
              className="transition-[transform,filter] duration-500 ease-out group-active:scale-[0.99] group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              onError={() => markFailed(primary.i)}
            />
          </button>

          {hasMosaic ? (
            <div className="hidden h-full min-h-0 grid-rows-2 gap-1.5 sm:grid sm:gap-2">
              <button
                type="button"
                onClick={() => openLightbox(1)}
                className="group relative min-h-0 cursor-pointer overflow-hidden bg-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
              >
                {sideA ? (
                  <GalleryImage
                    src={sideA.url}
                    alt=""
                    className="transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
                    onError={() => markFailed(sideA.i)}
                  />
                ) : (
                  <div className="h-full w-full bg-surface-secondary" />
                )}
              </button>
              <button
                type="button"
                onClick={() => openLightbox(Math.min(2, usable.length - 1))}
                className="group relative min-h-0 cursor-pointer overflow-hidden bg-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
              >
                {sideB ? (
                  <GalleryImage
                    src={sideB.url}
                    alt=""
                    className="transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
                    onError={() => markFailed(sideB.i)}
                  />
                ) : sideA ? (
                  <div className="flex h-full w-full items-center justify-center bg-surface-secondary/80 text-[13px] font-medium text-muted">
                    —
                  </div>
                ) : null}
              </button>
            </div>
          ) : null}
        </div>

        {usable.length > 1 ? (
          <button
            type="button"
            onClick={() => openLightbox(0)}
            className="absolute bottom-3 start-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border/70 bg-surface/95 px-3.5 py-2 text-[13px] font-bold text-text-primary shadow-sm backdrop-blur-md transition-[transform,background-color] duration-150 ease-out hover:bg-surface active:scale-[0.97] motion-reduce:active:scale-100 sm:bottom-4 sm:start-4"
          >
            <Grid2x2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            مشاهده همه {usable.length.toLocaleString("fa-IR")} عکس
          </button>
        ) : null}
      </div>

      <AnimatePresence>
        {lightboxOpen ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="گالری تصاویر"
            className="fixed inset-0 z-50 flex flex-col bg-black/92"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.25 }}
            onClick={() => setLightboxOpen(false)}
          >
            <div className="flex items-center justify-between px-4 py-3 text-white">
              <span className="text-[13px] font-medium tabular-nums">
                {(lightboxIndex + 1).toLocaleString("fa-IR")} /{" "}
                {usable.length.toLocaleString("fa-IR")}
              </span>
              <button
                type="button"
                aria-label="بستن"
                onClick={() => setLightboxOpen(false)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 active:scale-[0.97]"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>
            <div
              className="relative flex flex-1 items-center justify-center px-4 pb-8"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={usable[lightboxIndex]?.url}
                src={usable[lightboxIndex]?.url}
                alt={salonName}
                className="max-h-[78vh] max-w-full rounded-2xl object-contain"
                initial={reduceMotion ? false : { opacity: 0.6, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  bounce: 0,
                  duration: 0.35,
                }}
              />
            </div>
            {usable.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto px-4 pb-6">
                {usable.map((item, i) => (
                  <button
                    key={`${item.url}-${i}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(i);
                    }}
                    className={cn(
                      "h-16 w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-colors",
                      i === lightboxIndex
                        ? "border-white"
                        : "border-transparent opacity-70 hover:opacity-100",
                    )}
                  >
                    <GalleryImage src={item.url} alt="" />
                  </button>
                ))}
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
