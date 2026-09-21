import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "ایمیل الزامی است.").email("لطفاً یک ایمیل معتبر وارد کنید."),
  password: z.string().min(1, "رمز عبور الزامی است."),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "نام الزامی است.")
      .max(100, "نام باید حداکثر ۱۰۰ کاراکتر باشد."),
    email: z.string().min(1, "ایمیل الزامی است.").email("لطفاً یک ایمیل معتبر وارد کنید."),
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
