import { z } from "zod";

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "نام و نام خانوادگی الزامی است.")
    .max(100, "نام باید حداکثر ۱۰۰ کاراکتر باشد."),
  email: z
    .string()
    .trim()
    .max(256, "ایمیل باید حداکثر ۲۵۶ کاراکتر باشد.")
    .refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
      message: "ایمیل معتبر وارد کنید.",
    })
    .nullish(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// API wants { fullName, email? } — empty email means "don't change".
export function toUpdateProfileInput(data: ProfileFormData) {
  const email = data.email?.trim();
  return {
    fullName: data.fullName.trim(),
    ...(email ? { email } : {}),
  };
}
