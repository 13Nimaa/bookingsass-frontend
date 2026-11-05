import type { Metadata } from "next";
import { Suspense } from "react";
import { listBusinesses } from "@/lib/api/endpoints/business.endpoints";
import { parseBusinessListSearchParams } from "@/features/business/lib/list-query";
import {
  SalonDiscoveryPage,
  SalonDiscoverySkeleton,
} from "@/features/business/components/salon-discovery-page";

export const metadata: Metadata = {
  title: "سالن‌های زیبایی - BookingSaaS",
  description: "سالن موردنظرت رو پیدا کن و نوبتت رو آنلاین رزرو کن",
};

// Fresh on every request — search/sort stay in sync with the backend.
export const dynamic = "force-dynamic";

type BusinessesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function SalonDiscoveryLoader({ searchParams }: BusinessesPageProps) {
  const raw = await searchParams;
  const query = parseBusinessListSearchParams(raw);
  const { data, failed } = await listBusinesses(query);
  // Remount when search/sort changes so the infinite list resets from page 1.
  const filterKey = [
    query.search ?? "",
    query.city ?? "",
    query.sortBy ?? "id",
    query.sortOrder ?? "desc",
  ].join("|");
  return (
    <SalonDiscoveryPage
      key={filterKey}
      query={query}
      result={data}
      failed={failed}
    />
  );
}

export default function BusinessesPage(props: BusinessesPageProps) {
  return (
    <Suspense fallback={<SalonDiscoverySkeleton />}>
      <SalonDiscoveryLoader searchParams={props.searchParams} />
    </Suspense>
  );
}
