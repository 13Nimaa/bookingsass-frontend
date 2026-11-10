import { listServicesRequest } from "@/lib/api/endpoints/service.endpoints";
import type { ServiceDto } from "@/features/service/types";

export async function listPublicServices(
  businessId: number,
): Promise<{ data: ServiceDto[]; failed: boolean }> {
  try {
    const res = await listServicesRequest(businessId);
    if (!res.ok) return { data: [], failed: true };
    const body = (await res.json()) as unknown;
    if (!Array.isArray(body)) return { data: [], failed: true };
    const data: ServiceDto[] = [];
    for (const raw of body) {
      if (typeof raw !== "object" || raw === null) continue;
      const item = raw as Record<string, unknown>;
      if (typeof item.id !== "number") continue;
      if (typeof item.title !== "string") continue;
      if (typeof item.price !== "number") continue;
      if (typeof item.durationMinutes !== "number") continue;
      data.push({
        id: item.id,
        title: item.title,
        price: item.price,
        durationMinutes: item.durationMinutes,
        businessId:
          typeof item.businessId === "number" ? item.businessId : businessId,
      });
    }
    return { data, failed: false };
  } catch {
    return { data: [], failed: true };
  }
}
