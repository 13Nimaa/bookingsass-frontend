import { z } from "zod";

export const businessSchema = z.object({
  name: z
    .string()
    .min(1, "نام کسب‌وکار الزامی است.")
    .max(100, "نام کسب‌وکار باید حداکثر ۱۰۰ کاراکتر باشد."),
  city: z
    .string()
    .min(1, "شهر الزامی است.")
    .max(60, "نام شهر باید حداکثر ۶۰ کاراکتر باشد."),
  address: z
    .string()
    .min(1, "نشانی الزامی است.")
    .max(300, "نشانی باید حداکثر ۳۰۰ کاراکتر باشد."),
  description: z
    .string()
    .max(1000, "توضیحات باید حداکثر ۱۰۰۰ کاراکتر باشد.")
    .nullish(),
});

export type BusinessFormData = z.infer<typeof businessSchema>;

// API contract wants null for empty, not ""
export function toBusinessInput(data: BusinessFormData) {
  return {
    name: data.name.trim(),
    city: data.city.trim(),
    address: data.address.trim(),
    description: data.description?.trim() ? data.description.trim() : null,
  };
}
