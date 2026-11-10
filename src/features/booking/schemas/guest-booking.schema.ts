import { z } from "zod";
import { normalizePhone } from "@/features/employee/schemas/employee.schema";

export const guestBookingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "نام الزامی است.")
    .max(150, "نام نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد."),
  phoneNumber: z
    .string()
    .min(1, "شماره موبایل الزامی است.")
    .refine((value) => /^09\d{9}$/.test(normalizePhone(value)), {
      message: "شماره موبایل معتبر نیست. نمونه: ۰۹۱۲۳۴۵۶۷۸۹",
    }),
});

export type GuestBookingFormData = z.infer<typeof guestBookingSchema>;

export function toGuestPhone(value: string): string {
  return normalizePhone(value);
}
