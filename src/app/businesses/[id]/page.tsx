import type { Metadata } from "next";
import { Suspense } from "react";
import { getBusinessById } from "@/lib/api/endpoints/business.endpoints";
import { listPublicServices } from "@/features/business/lib/public-catalog";
import {
  SalonDetailFailed,
  SalonDetailNotFound,
  SalonDetailPage,
  SalonDetailSkeleton,
} from "@/features/business/components/salon-detail-page";

export const dynamic = "force-dynamic";

type SalonDetailRouteProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: SalonDetailRouteProps): Promise<Metadata> {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    return { title: "سالن پیدا نشد - BookingSaaS" };
  }
  const { data } = await getBusinessById(numericId);
  if (!data) return { title: "سالن پیدا نشد - BookingSaaS" };
  return {
    title: `${data.name} - BookingSaaS`,
    description:
      data.description?.trim() ||
      `مشاهده اطلاعات و رزرو نوبت در ${data.name}`,
  };
}

async function SalonDetailLoader({ params }: SalonDetailRouteProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    return <SalonDetailNotFound />;
  }

  const [businessResult, servicesResult] = await Promise.all([
    getBusinessById(numericId),
    listPublicServices(numericId),
  ]);

  if (businessResult.notFound) return <SalonDetailNotFound />;
  if (businessResult.failed || !businessResult.data) {
    return <SalonDetailFailed />;
  }

  const business = businessResult.data;

  return (
    <SalonDetailPage
      business={business}
      services={servicesResult.data}
      servicesFailed={servicesResult.failed}
      employees={business.employees}
    />
  );
}

export default function SalonDetailRoute(props: SalonDetailRouteProps) {
  return (
    <Suspense fallback={<SalonDetailSkeleton />}>
      <SalonDetailLoader params={props.params} />
    </Suspense>
  );
}
