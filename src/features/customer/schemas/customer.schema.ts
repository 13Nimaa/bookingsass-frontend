import { z } from "zod";
import { normalizePhone } from "@/features/employee/schemas/employee.schema";
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "@/features/customer/types";

export { normalizePhone };

export function formatPhoneDisplay(value: string): string {
  const digits = normalizePhone(value).slice(0, 11);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}

export const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "نام مشتری الزامی است.")
    .max(150, "نام مشتری باید حداکثر ۱۵۰ کاراکتر باشد."),
  phoneNumber: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^09\d{9}$/.test(normalizePhone(value)),
      { message: "شمارهٔ موبایل معتبر نیست. نمونه: ۰۹۱۲۳۴۵۶۷۸۹" },
    ),
  email: z
    .string()
    .trim()
    .max(256, "ایمیل باید حداکثر ۲۵۶ کاراکتر باشد.")
    .refine(
      (value) => value === "" || z.string().email().safeParse(value).success,
      { message: "ایمیل معتبر نیست." },
    ),
  notes: z
    .string()
    .max(2000, "یادداشت باید حداکثر ۲۰۰۰ کاراکتر باشد."),
  isActive: z.boolean(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function toCreateCustomerInput(data: CustomerFormData): CreateCustomerInput {
  const phone = emptyToNull(data.phoneNumber);
  return {
    name: data.name.trim(),
    phoneNumber: phone ? normalizePhone(phone) : null,
    email: emptyToNull(data.email),
    notes: emptyToNull(data.notes),
  };
}

export function toUpdateCustomerInput(data: CustomerFormData): UpdateCustomerInput {
  return {
    ...toCreateCustomerInput(data),
    isActive: data.isActive,
  };
}
