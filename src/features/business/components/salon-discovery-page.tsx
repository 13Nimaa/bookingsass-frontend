"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Flower2, Loader2, Search, Store } from "lucide-react";
import { AuthError } from "@/components/shared/auth-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import { Navbar } from "@/components/layout/navbar";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { listBusinesses } from "@/lib/api/endpoints/business.endpoints";
import type {
  BusinessDto,
  BusinessListQuery,
  PagedBusinesses,
} from "@/features/business/types";
import {
  BUSINESS_PAGE_SIZE,
  DISCOVERY_SORT_OPTIONS,
  businessListQueryToSearchParams,
  discoverySortToApi,
  sortSelectValue,
} from "@/features/business/lib/list-query";
import {
  SalonCard,
  SalonCardSkeleton,
} from "@/features/business/components/salon-card";

const SORT_OPTIONS = DISCOVERY_SORT_OPTIONS.filter((o) => o.enabled).map(
  (o) => ({ value: o.value, label: o.label }),
);

export function SalonDiscoverySkeleton() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <Navbar />
      <section className="border-b border-border-subtle bg-[#f7f2eb]">
        <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-8 lg:px-8">
          <div className="skeleton-shimmer h-8 w-48 rounded-lg bg-primary/10" />
          <div className="skeleton-shimmer mt-3 h-4 w-72 max-w-full rounded bg-primary/10" />
        </div>
      </section>
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="skeleton-shimmer h-[58px] w-full rounded-[14px] bg-surface-secondary" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SalonCardSkeleton key={index} />
          ))}
        </div>
      </div>
      <MobileTabBar />
    </div>
  );
}

function mergeUnique(
  current: BusinessDto[],
  incoming: BusinessDto[],
): BusinessDto[] {
  if (incoming.length === 0) return current;
  const seen = new Set(current.map((item) => item.id));
  const next = [...current];
  for (const item of incoming) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    next.push(item);
  }
  return next;
}

interface SalonDiscoveryPageProps {
  query: BusinessListQuery;
  result: PagedBusinesses;
  failed: boolean;
}

export function SalonDiscoveryPage({
  query,
  result,
  failed: initialFailed,
}: SalonDiscoveryPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = React.useTransition();
  const [searchInput, setSearchInput] = React.useState(query.search ?? "");

  const [items, setItems] = React.useState(result.items);
  const [page, setPage] = React.useState(result.page);
  const [hasNextPage, setHasNextPage] = React.useState(result.hasNextPage);
  const [totalCount, setTotalCount] = React.useState(result.totalCount);
  const [failed, setFailed] = React.useState(initialFailed);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [loadMoreError, setLoadMoreError] = React.useState<string | null>(null);

  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = React.useRef(false);

  const replaceQuery = React.useCallback(
    (patch: Partial<BusinessListQuery>) => {
      const next: BusinessListQuery = {
        ...query,
        ...patch,
        page: 1,
      };
      const params = businessListQueryToSearchParams(next);
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [pathname, query, router],
  );

  const commitSearch = React.useEffectEvent((value: string) => {
    const nextSearch = value.trim();
    const currentSearch = query.search?.trim() ?? "";
    if (nextSearch === currentSearch) return;
    replaceQuery({ search: nextSearch || undefined });
  });

  React.useEffect(() => {
    const timer = window.setTimeout(() => commitSearch(searchInput), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const loadMore = React.useEffectEvent(async () => {
    if (!hasNextPage || loadingMoreRef.current || failed) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setLoadMoreError(null);

    const { data, failed: nextFailed } = await listBusinesses({
      search: query.search,
      sortBy: query.sortBy ?? "id",
      sortOrder: query.sortOrder ?? "desc",
      page: page + 1,
      pageSize: BUSINESS_PAGE_SIZE,
    });

    if (nextFailed) {
      setLoadMoreError("بارگذاری سالن‌های بیشتر ممکن نشد.");
      loadingMoreRef.current = false;
      setLoadingMore(false);
      return;
    }

    setItems((prev) => mergeUnique(prev, data.items));
    setPage(data.page);
    setHasNextPage(data.hasNextPage);
    setTotalCount(data.totalCount);
    loadingMoreRef.current = false;
    setLoadingMore(false);
  });

  React.useEffect(() => {
    const node = sentinelRef.current;
    // Pause auto-fetch after a load-more error until the user retries.
    if (!node || !hasNextPage || failed || loadMoreError) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore();
        }
      },
      { root: null, rootMargin: "280px 0px", threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, failed, loadMoreError, items.length]);

  const hasSearch = Boolean(query.search?.trim());

  const clearFilters = () => {
    setSearchInput("");
    replaceQuery({
      search: undefined,
      sortBy: "id",
      sortOrder: "desc",
    });
  };

  const retryInitial = () => {
    setFailed(false);
    router.refresh();
  };

  const isEmptyCatalog = !failed && totalCount === 0 && !hasSearch;
  const isEmptyFiltered = !failed && totalCount === 0 && hasSearch;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <Navbar />

      {/* <section className="relative overflow-hidden border-b border-border-subtle bg-[#f7f2eb]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -start-20 -top-10 h-48 w-48 rounded-full bg-[#e8d9c8]/55 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -end-16 bottom-[-2rem] h-40 w-40 rounded-full bg-[#d9e0d4]/45 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute end-8 top-3 text-primary/[0.08] sm:end-16 sm:top-4"
        >
          <Flower2 className="h-24 w-24 sm:h-28 sm:w-28" strokeWidth={1} />
        </div>

        <div className="relative mx-auto flex w-full max-w-7xl items-center gap-3.5 px-4 py-7 sm:gap-4 sm:px-6 sm:py-8 lg:px-8">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center text-primary sm:h-11 sm:w-11">
            <Flower2
              className="h-7 w-7 sm:h-8 sm:w-8"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-[26px] leading-[1.25] font-bold text-text-primary sm:text-[30px]">
              سالن‌های زیبایی
            </h1>
            <p className="mt-2.5 max-w-xl text-[14px] leading-6 text-muted sm:text-[15px] sm:leading-7">
              سالن موردنظرت رو پیدا کن و نوبتت رو آنلاین رزرو کن
            </p>
          </div>
        </div>
      </section> */}

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-7 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3.5">
          <div className="min-w-0 flex-1">
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="نام سالن یا شهر موردنظرت رو جستجو کن..."
              startIcon={
                <Search
                  className="h-[18px] w-[18px]"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              }
              aria-label="جستجوی سالن"
              className="h-[58px] rounded-[14px] border-border bg-surface text-[15px] shadow-none"
            />
          </div>

          <div className="w-full shrink-0 sm:w-[200px]">
            <SelectField
              value={sortSelectValue(query.sortOrder)}
              onValueChange={(value) => {
                const { sortBy, sortOrder } = discoverySortToApi(value);
                replaceQuery({ sortBy, sortOrder });
              }}
              options={SORT_OPTIONS}
              placeholder="مرتب‌سازی"
              triggerClassName="h-[58px] rounded-[14px] border-border bg-surface px-3.5 text-[14px] font-medium shadow-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 data-popup-open:border-primary data-popup-open:ring-2 data-popup-open:ring-primary/15"
            />
          </div>
        </div>

        <div className="mt-8" aria-busy={isPending || loadingMore || undefined}>
          {isPending ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <SalonCardSkeleton key={index} />
              ))}
            </div>
          ) : null}

          {!isPending && failed ? (
            <div className="mx-auto max-w-md space-y-4 py-10 text-center">
              <AuthError message="دریافت فهرست سالن‌ها ممکن نشد. لطفاً دوباره تلاش کنید." />
              <Button
                type="button"
                onClick={retryInitial}
                className="h-11 rounded-xl px-5"
              >
                تلاش دوباره
              </Button>
            </div>
          ) : null}

          {!isPending && isEmptyCatalog ? (
            <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Store className="h-7 w-7" aria-hidden="true" />
              </span>
              <h2 className="text-[18px] font-bold text-text-primary">
                هنوز سالنی ثبت نشده است
              </h2>
              <p className="text-[14px] leading-6 text-muted">
                به‌زودی سالن‌های زیبایی اینجا نمایش داده می‌شوند.
              </p>
            </div>
          ) : null}

          {!isPending && isEmptyFiltered ? (
            <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Search className="h-7 w-7" aria-hidden="true" />
              </span>
              <h2 className="text-[18px] font-bold text-text-primary">
                سالن موردنظرت پیدا نشد
              </h2>
              <p className="text-[14px] leading-6 text-muted">
                عبارت جستجو را تغییر بده و دوباره امتحان کن.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                className="mt-1 h-11 rounded-xl px-5"
              >
                پاک کردن فیلترها
              </Button>
            </div>
          ) : null}

          {!isPending && !failed && items.length > 0 ? (
            <>
              <ul className="grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((business) => (
                  <li key={business.id}>
                    <SalonCard business={business} />
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-center text-[13px] font-medium text-muted tnum">
                {items.length.toLocaleString("fa-IR")} از{" "}
                {totalCount.toLocaleString("fa-IR")} سالن
              </p>

              <div
                ref={sentinelRef}
                className="flex min-h-12 items-center justify-center py-4"
                aria-hidden={!loadingMore}
              >
                {loadingMore ? (
                  <div className="flex items-center gap-2 text-[13px] font-medium text-muted">
                    <Loader2
                      className="h-4 w-4 animate-spin text-primary"
                      aria-hidden="true"
                    />
                    در حال بارگذاری...
                  </div>
                ) : null}
              </div>

              {loadMoreError ? (
                <div className="mx-auto flex max-w-sm flex-col items-center gap-3 pb-6 text-center">
                  <AuthError message={loadMoreError} />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-xl px-4"
                    onClick={() => void loadMore()}
                  >
                    تلاش دوباره
                  </Button>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      <MobileTabBar />
    </div>
  );
}
