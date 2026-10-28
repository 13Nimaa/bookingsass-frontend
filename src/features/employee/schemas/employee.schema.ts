import { z } from "zod";
import type { CreateEmployeeInput } from "@/features/employee/types";

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

// Accepts Persian/Arabic digits, spaces, dashes and +98 / 0098 prefixes and
// returns a canonical local 09xxxxxxxxx number.
export function normalizePhone(input: string): string {
  let value = input
    .trim()
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)))
    .replace(/[\s()-]/g, "");

  if (value.startsWith("+98")) value = `0${value.slice(3)}`;
  else if (value.startsWith("0098")) value = `0${value.slice(4)}`;
  else if (value.startsWith("98") && value.length === 12) value = `0${value.slice(2)}`;

  return value;
}

export const employeeSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, "شمارهٔ موبایل الزامی است.")
    .refine((value) => /^09\d{9}$/.test(normalizePhone(value)), {
      message: "شمارهٔ موبایل معتبر نیست. نمونه: ۰۹۱۲۳۴۵۶۷۸۹",
    }),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;

// API contract wants the canonical 09xxxxxxxxx form.
export function toAddEmployeeInput(data: EmployeeFormData): CreateEmployeeInput {
  return { phoneNumber: normalizePhone(data.phoneNumber) };
}
