import type {
  BusinessListQuery,
  BusinessSortBy,
  BusinessSortOrder,
} from "@/features/business/types";

export const BUSINESS_PAGE_SIZE = 9;

const SORT_ORDER: ReadonlySet<string> = new Set(["asc", "desc"]);

export type DiscoverySortValue = "newest" | "top_rated" | "lowest_price";

/** Only values the current API can honor are enabled. */
export const DISCOVERY_SORT_OPTIONS = [
  { value: "newest" as const, label: "جدیدترین", enabled: true },
  { value: "top_rated" as const, label: "بالاترین امتیاز", enabled: false },
  { value: "lowest_price" as const, label: "ارزان‌ترین", enabled: false },
] as const;

function first(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseBusinessListSearchParams(
  params: Record<string, string | string[] | undefined>,
): BusinessListQuery {
  const search = first(params.search)?.trim() || undefined;
  const city = first(params.city)?.trim() || undefined;

  const sortUi = first(params.sort)?.trim().toLowerCase() as
    | DiscoverySortValue
    | undefined;

  const { sortBy, sortOrder } = discoverySortToApi(sortUi);

  // Legacy URL support: sortOrder=asc|desc without sort=
  const sortOrderRaw = first(params.sortOrder)?.trim().toLowerCase();
  const legacyOrder: BusinessSortOrder | undefined =
    sortOrderRaw && SORT_ORDER.has(sortOrderRaw) && !sortUi
      ? (sortOrderRaw as BusinessSortOrder)
      : undefined;

  return {
    search,
    city,
    sortBy: legacyOrder ? "id" : sortBy,
    sortOrder: legacyOrder ?? sortOrder,
    page: 1,
    pageSize: BUSINESS_PAGE_SIZE,
  };
}

export function businessListQueryToSearchParams(
  query: BusinessListQuery & { sortUi?: DiscoverySortValue },
): URLSearchParams {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.city?.trim()) params.set("city", query.city.trim());

  const sortUi =
    query.sortUi ??
    apiToDiscoverySort(query.sortBy ?? "id", query.sortOrder ?? "desc");

  // Default = newest — omit from URL when default.
  if (sortUi && sortUi !== "newest") {
    params.set("sort", sortUi);
  }

  return params;
}

export function discoverySortToApi(sort?: DiscoverySortValue | string): {
  sortBy: BusinessSortBy;
  sortOrder: BusinessSortOrder;
} {
  switch (sort) {
    case "top_rated":
    case "lowest_price":
      // Not supported by API yet — fall back to newest.
      return { sortBy: "id", sortOrder: "desc" };
    case "newest":
    default:
      return { sortBy: "id", sortOrder: "desc" };
  }
}

export function apiToDiscoverySort(
  sortBy?: BusinessSortBy,
  sortOrder?: BusinessSortOrder,
): DiscoverySortValue {
  void sortBy;
  void sortOrder;
  return "newest";
}

export function sortSelectValue(
  sortOrder: BusinessSortOrder = "desc",
  sortParam?: string | null,
): DiscoverySortValue {
  void sortOrder;
  if (sortParam === "top_rated") return "top_rated";
  if (sortParam === "lowest_price") return "lowest_price";
  return "newest";
}

/** @deprecated Prefer discoverySortToApi — kept for older call sites. */
export function parseSortSelectValue(value: string): {
  sortBy: BusinessSortBy;
  sortOrder: BusinessSortOrder;
} {
  if (value === "id:asc") return { sortBy: "id", sortOrder: "asc" };
  return discoverySortToApi(value);
}
