import { z } from "zod";
import type { ServiceInput } from "@/features/service/types";

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export const DURATION_MIN = 5;
export const DURATION_MAX = 240;
export const DURATION_PRESETS = [15, 30, 45, 60, 90] as const;

export function toAsciiDigits(input: string): string {
  return input
    .trim()
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)))
    .replace(/[,\s٬]/g, "");
}

export function toPersianDigits(input: string): string {
  return input.replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)] ?? d);
}

/** Format a raw digit string as Persian grouped number (e.g. ۴۰٬۰۰۰). */
export function formatPriceDisplay(raw: string): string {
  const ascii = toAsciiDigits(raw).replace(/\D/g, "");
  if (!ascii) return "";
  return toPersianDigits(Number(ascii).toLocaleString("en-US")).replace(
    /,/g,
    "٬"
  );
}

function numericField(label: string, min: number, max?: number) {
  return z
    .string()
    .min(1, `${label} الزامی است.`)
    .refine((value) => /^\d+$/.test(toAsciiDigits(value)), {
      message: `${label} باید عدد معتبر باشد.`,
    })
    .refine(
      (value) => {
        const n = Number(toAsciiDigits(value));
        if (!Number.isInteger(n) || n < min) return false;
        if (max !== undefined && n > max) return false;
        return true;
      },
      {
        message:
          max !== undefined
            ? `${label} باید بین ${min.toLocaleString("fa-IR")} و ${max.toLocaleString("fa-IR")} باشد.`
            : min === 0
              ? `${label} نمی‌تواند منفی باشد.`
              : `${label} باید حداقل ${min.toLocaleString("fa-IR")} باشد.`,
      }
    );
}

export const serviceSchema = z.object({
  title: z
    .string()
    .min(1, "عنوان خدمت الزامی است.")
    .max(100, "عنوان خدمت باید حداکثر ۱۰۰ کاراکتر باشد."),
  price: numericField("قیمت", 0),
  durationMinutes: numericField("مدت زمان", DURATION_MIN, DURATION_MAX),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

export function toServiceInput(data: ServiceFormData): ServiceInput {
  return {
    title: data.title.trim(),
    price: Number(toAsciiDigits(data.price)),
    durationMinutes: Number(toAsciiDigits(data.durationMinutes)),
  };
}
