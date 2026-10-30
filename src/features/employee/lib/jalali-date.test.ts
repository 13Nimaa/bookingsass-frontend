import { describe, expect, it } from "vitest";
import {
  formatGregorianIsoToJalali,
  gregorianIsoToJalali,
  jalaliToGregorianIso,
  shiftGregorianIsoDate,
} from "@/features/employee/lib/jalali-date";

describe("Jalali date conversion", () => {
  it("converts Nowruz and a regular date to the Gregorian ISO value required by the API", () => {
    expect(jalaliToGregorianIso({ year: 1403, month: 1, day: 1 })).toBe("2024-03-20");
    expect(jalaliToGregorianIso({ year: 1404, month: 8, day: 8 })).toBe("2025-10-30");
  });

  it("converts a persisted Gregorian ISO date back to the Jalali display date", () => {
    expect(gregorianIsoToJalali("2026-03-21")).toEqual({ year: 1405, month: 1, day: 1 });
    expect(formatGregorianIsoToJalali("2025-10-30")).toContain("۱۴۰۴");
  });

  it("shifts dates across Gregorian month boundaries for copy actions", () => {
    expect(shiftGregorianIsoDate("2026-03-01", -1)).toBe("2026-02-28");
    expect(shiftGregorianIsoDate("2025-12-31", 1)).toBe("2026-01-01");
  });
});
