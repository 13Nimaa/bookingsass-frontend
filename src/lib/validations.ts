import { z } from "zod";

// Accepts common Iranian mobile formats and normalizes to 09xxxxxxxxx:
// 09123456789, +989123456789, 00989123456789, 989123456789, 9123456789
function normalizePhoneNumber(value: string): string {
  const cleaned = value.replace(/[\s()-]/g, "");
  if (cleaned.startsWith("+989")) return `0${cleaned.slice(3)}`;
  if (cleaned.startsWith("00989")) return `0${cleaned.slice(4)}`;
  if (cleaned.startsWith("989")) return `0${cleaned.slice(2)}`;
  if (/^9\d{9}$/.test(cleaned)) return `0${cleaned}`;
  return cleaned;
}

export const phoneNumberSchema = z
  .string()
  .min(1, "شماره موبایل الزامی است.")
  .transform(normalizePhoneNumber)
  .refine((value) => /^09\d{9}$/.test(value), {
    message: "شماره موبایل معتبر وارد کنید (مثال: 09123456789).",
  });

export const loginSchema = z.object({
  phoneNumber: phoneNumberSchema,
  password: z.string().min(1, "رمز عبور الزامی است."),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "نام الزامی است.")
      .max(100, "نام باید حداکثر ۱۰۰ کاراکتر باشد."),
    phoneNumber: phoneNumberSchema,
    password: z
      .string()
      .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد.")
      .max(128, "رمز عبور باید حداکثر ۱۲۸ کاراکتر باشد.")
      .regex(/[A-Z]/, "رمز عبور باید حداقل یک حرف بزرگ انگلیسی داشته باشد.")
      .regex(/[a-z]/, "رمز عبور باید حداقل یک حرف کوچک انگلیسی داشته باشد.")
      .regex(/[0-9]/, "رمز عبور باید حداقل یک عدد داشته باشد."),
    confirmPassword: z.string().min(1, "لطفاً رمز عبور را دوباره وارد کنید."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "رمزهای عبور یکسان نیستند.",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
