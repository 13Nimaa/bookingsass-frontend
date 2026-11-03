const TEHRAN = "Asia/Tehran";

export function formatBookingPrice(price: number | null | undefined): string | null {
  if (price == null) return null;
  return `${price.toLocaleString("fa-IR")} تومان`;
}

export function formatBookingDate(iso: string): string {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TEHRAN,
  }).format(new Date(iso));
}

export function formatBookingTime(iso: string): string {
  return new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TEHRAN,
  }).format(new Date(iso));
}

export function formatBookingTimeRange(startIso: string, endIso: string): string {
  return `${formatBookingTime(startIso)} – ${formatBookingTime(endIso)}`;
}

/** Inclusive start of a Gregorian calendar day in Asia/Tehran, as UTC ISO. */
export function dayStartUtcIso(gregorianYmd: string): string {
  return new Date(`${gregorianYmd}T00:00:00+03:30`).toISOString();
}

/** Inclusive end of a Gregorian calendar day in Asia/Tehran, as UTC ISO. */
export function dayEndUtcIso(gregorianYmd: string): string {
  return new Date(`${gregorianYmd}T23:59:59.999+03:30`).toISOString();
}
