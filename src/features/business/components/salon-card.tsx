"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  CalendarDays,
  ImageOff,
  MapPin,
} from "lucide-react";
import { cn } from "cn";
import type { BusinessDto } from "@/features/business/types";

function locationLabel(business: BusinessDto): string {
  const city = business.city?.trim() ?? "";
  const address = business.address?.trim() ?? "";
  if (city && address) {
    const short = address.length > 40 ? `${address.slice(0, 40)}…` : address;
    return `${city}، ${short}`;
  }
  return city || address || "موقعیت ثبت نشده";
}

export function SalonCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-border bg-surface"
      aria-hidden="true"
    >
      <div className="skeleton-shimmer aspect-[1.55/1] w-full bg-surface-secondary" />
      <div className="space-y-3 p-4 sm:p-5">
        <div className="skeleton-shimmer h-5 w-3/4 rounded-lg bg-surface-secondary" />
        <div className="skeleton-shimmer h-4 w-1/2 rounded bg-surface-secondary" />
        <div className="skeleton-shimmer h-10 w-full rounded bg-surface-secondary" />
        <div className="flex gap-2.5 pt-1">
          <div className="skeleton-shimmer h-11 flex-1 rounded-xl bg-surface-secondary" />
          <div className="skeleton-shimmer h-11 flex-1 rounded-xl bg-surface-secondary" />
        </div>
      </div>
    </div>
  );
}

export function SalonCard({ business }: { business: BusinessDto }) {
  const router = useRouter();
  const [imgFailed, setImgFailed] = React.useState(false);
  const detailHref = `/businesses/${business.id}`;
  const hasImage = Boolean(business.profileImageUrl) && !imgFailed;
  const description = business.description?.trim() || null;

  const goToDetail = () => {
    router.push(detailHref);
  };

  return (
    <article
      className={cn(
        "group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-surface",
        "shadow-[0_1px_2px_rgba(34,31,28,0.04)] transition-[border-color,box-shadow] duration-200",
        "hover:border-border-strong hover:shadow-[0_10px_24px_-18px_rgba(34,31,28,0.22)]",
      )}
      onClick={goToDetail}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          goToDetail();
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`مشاهده ${business.name}`}
    >
      <div className="relative aspect-[1.55/1] w-full overflow-hidden bg-surface-secondary">
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={business.profileImageUrl!}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted/60">
            <ImageOff className="h-8 w-8" aria-hidden="true" />
            <span className="text-[12px] font-medium">بدون تصویر</span>
          </div>
        )}

        {/* Visual only — favorites are not backed by an API yet */}
        <button
          type="button"
          aria-label="ذخیره سالن (به‌زودی)"
          className="absolute start-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface/95 text-muted shadow-[0_1px_3px_rgba(34,31,28,0.10)] transition-colors duration-150 hover:bg-surface hover:text-text-primary"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <Bookmark className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h2 className="mb-2 line-clamp-2 text-[18px] leading-7 font-bold text-text-primary sm:text-[19px]">
          {business.name}
        </h2>

        <p className="flex items-center gap-2 text-[13px] font-medium leading-5 text-muted">
          <MapPin
            className="h-3.5 w-3.5 shrink-0 text-muted/80"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <span className="line-clamp-1">{locationLabel(business)}</span>
        </p>

        {description ? (
          <p className="mt-3 line-clamp-2 text-[14px] leading-7 text-muted/90">
            {description}
          </p>
        ) : null}

        <div className="mt-auto flex gap-2.5 pt-4">
          <Link
            href={detailHref}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-[13px] font-medium text-text-primary transition-colors duration-150 hover:border-border-strong hover:bg-surface-secondary"
          >
            مشاهده سالن
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
          </Link>
          <Link
            href={detailHref}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-[13px] font-medium text-white transition-colors duration-150 hover:bg-primary-hover active:bg-primary-pressed"
          >
            <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
            رزرو نوبت
          </Link>
        </div>
      </div>
    </article>
  );
}
