"use client";

import * as React from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Eye,
  EyeOff,
  Loader2,
  TrendingUp,
  Users,
} from "lucide-react";
import { registerSchema, type RegisterFormData } from "@/lib/validations";
import { PasswordStrength } from "@/components/ui/password-strength";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "ایمیل را وارد کنید.")
    .email("فرمت ایمیل صحیح نیست."),

  password: z
    .string()
    .min(1, "رمز عبور را وارد کنید."),

  rememberMe: z.boolean().default(false),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = RegisterFormData;

type InternalFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  rememberMe: boolean;
};

type CommonProps = {
  logo: React.ReactNode;
  title?: string;
  description?: string;
  imageSrc: string;
  imageAlt?: string;
};

type LoginProps = CommonProps & {
  mode?: "login";
  onSubmit: (data: LoginFormValues) => Promise<void>;
  forgotPasswordHref: string;
  createAccountHref: string;
};

type SignupProps = CommonProps & {
  mode: "signup";
  onSubmit: (data: SignupFormValues) => Promise<void>;
  loginHref: string;
};

type AuthFormSplitScreenProps = LoginProps | SignupProps;

export function AuthFormSplitScreen(props: AuthFormSplitScreenProps) {
  const isSignup = props.mode === "signup";
  const {
    logo,
    imageSrc,
    imageAlt = "مدیریت آرایشگاه",
    title = isSignup ? "ساخت حساب کاربری" : "خوش آمدید",
    description = isSignup
      ? "همین حالا حساب خود را بسازید و مدیریت آرایشگاه را شروع کنید."
      : "برای ورود به پنل مدیریت، اطلاعات حساب خود را وارد کنید.",
  } = props;

  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitError, setSubmitError] = React.useState("");

  const schema = isSignup
    ? (registerSchema as unknown as z.ZodType<InternalFormValues>)
    : (loginSchema as unknown as z.ZodType<InternalFormValues>);

  const form = useForm<InternalFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      rememberMe: false,
    },
  });

  const passwordValue = form.watch("password");

  const handleFormSubmit = async (data: InternalFormValues) => {
    setIsLoading(true);
    setSubmitError("");

    try {
      if (isSignup) {
        await props.onSubmit({
          name: data.name,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
        });
      } else {
        await props.onSubmit({
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe,
        });
      }
    } catch (error) {
      console.error(isSignup ? "Signup failed:" : "Login failed:", error);
      setSubmitError(
        error instanceof Error && error.message
          ? error.message
          : isSignup
            ? "ثبت‌نام انجام نشد. اطلاعات را بررسی کنید."
            : "ورود انجام نشد. لطفاً اطلاعات خود را بررسی کنید."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 12,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const,
      },
    },
  };

  const inputClassName = `
    h-11
    w-full
    rounded-xl
    border
    border-[#E5E7EB]
    bg-white
    px-3.5
    text-sm
    text-[#111827]
    outline-none
    transition-all
    placeholder:text-[#9CA3AF]
    hover:border-[#D1D5DB]
    focus:border-[#6366F1]
    focus:ring-4
    focus:ring-[#EEF2FF]
    disabled:cursor-not-allowed
    disabled:bg-[#F9FAFB]
    disabled:opacity-60
  `;

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full bg-[#F8F9FB] lg:grid lg:grid-cols-2"
    >
      {/* =========================
          FORM
      ========================== */}

      <div className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[420px]"
        >
          {/* Logo */}

          <motion.div variants={itemVariants} className="mb-8">
            {logo}
          </motion.div>

          {/* Heading */}

          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-[28px] font-bold text-[#111827]">
              {title}
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              {description}
            </p>
          </motion.div>

          <form
            noValidate
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-5"
          >
            {/* =========================
                NAME (signup only)
            ========================== */}

            {isSignup && (
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-[#374151]"
                >
                  نام
                </label>

                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="مثلاً علی رضایی"
                  disabled={isLoading}
                  {...form.register("name")}
                  className={inputClassName}
                />

                {form.formState.errors.name && (
                  <p className="mt-1.5 text-xs text-[#DC2626]">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </motion.div>
            )}

            {/* =========================
                EMAIL
            ========================== */}

            <motion.div variants={itemVariants}>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#374151]"
              >
                ایمیل
              </label>

              <input
                id="email"
                type="email"
                dir="ltr"
                autoComplete="email"
                placeholder="you@example.com"
                disabled={isLoading}
                {...form.register("email")}
                className={inputClassName}
              />

              {form.formState.errors.email && (
                <p className="mt-1.5 text-xs text-[#DC2626]">
                  {form.formState.errors.email.message}
                </p>
              )}
            </motion.div>

            {/* =========================
                PASSWORD
            ========================== */}

            <motion.div variants={itemVariants}>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#374151]"
              >
                رمز عبور
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  autoComplete={
                    isSignup ? "new-password" : "current-password"
                  }
                  placeholder="••••••••"
                  disabled={isLoading}
                  {...form.register("password")}
                  className={`${inputClassName} pl-11`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isLoading}
                  aria-label={
                    showPassword
                      ? "مخفی کردن رمز عبور"
                      : "نمایش رمز عبور"
                  }
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-[#9CA3AF]
                    transition
                    hover:text-[#4B5563]
                    disabled:opacity-50
                  "
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {form.formState.errors.password && (
                <p className="mt-1.5 text-xs text-[#DC2626]">
                  {form.formState.errors.password.message}
                </p>
              )}

              {isSignup && (
                <div className="mt-2">
                  <PasswordStrength password={passwordValue ?? ""} />
                </div>
              )}
            </motion.div>

            {/* =========================
                CONFIRM PASSWORD (signup only)
            ========================== */}

            {isSignup && (
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-[#374151]"
                >
                  تکرار رمز عبور
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    dir="ltr"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    disabled={isLoading}
                    {...form.register("confirmPassword")}
                    className={`${inputClassName} pl-11`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={isLoading}
                    aria-label={
                      showPassword
                        ? "مخفی کردن رمز عبور"
                        : "نمایش رمز عبور"
                    }
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      text-[#9CA3AF]
                      transition
                      hover:text-[#4B5563]
                      disabled:opacity-50
                    "
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {form.formState.errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-[#DC2626]">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </motion.div>
            )}

            {/* =========================
                REMEMBER + FORGOT (login only)
            ========================== */}

            {!isSignup && (
              <motion.div
                variants={itemVariants}
                className="flex items-center justify-between"
              >
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    disabled={isLoading}
                    {...form.register("rememberMe")}
                    className="
                      h-4
                      w-4
                      cursor-pointer
                      rounded
                      border-[#D1D5DB]
                      accent-[#4F46E5]
                    "
                  />

                  <span className="text-xs text-[#6B7280]">
                    مرا به خاطر بسپار
                  </span>
                </label>

                <a
                  href={props.forgotPasswordHref}
                  className="
                    text-xs
                    font-medium
                    text-[#4F46E5]
                    transition
                    hover:text-[#4338CA]
                  "
                >
                  فراموشی رمز عبور؟
                </a>
              </motion.div>
            )}

            {/* =========================
                SERVER ERROR
            ========================== */}

            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="
                  rounded-xl
                  border
                  border-[#FECACA]
                  bg-[#FEF2F2]
                  px-4
                  py-3
                  text-xs
                  text-[#991B1B]
                "
              >
                {submitError}
              </motion.div>
            )}

            {/* =========================
                SUBMIT
            ========================== */}

            <motion.div variants={itemVariants}>
              <button
                type="submit"
                disabled={isLoading}
                className="
                  flex
                  h-11
                  w-full
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#4F46E5]
                  text-sm
                  font-medium
                  text-white
                  shadow-[0_1px_2px_rgba(0,0,0,0.05)]
                  transition-all
                  hover:bg-[#4338CA]
                  active:bg-[#3730A3]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {isLoading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    {isSignup ? "در حال ثبت‌نام..." : "در حال ورود..."}
                  </>
                ) : isSignup ? (
                  <>
                    ایجاد حساب کاربری
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    ورود به پنل
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </>
                )}
              </button>
            </motion.div>
          </form>

          {/* =========================
              FOOTER LINK
          ========================== */}

          <motion.p
            variants={itemVariants}
            className="mt-7 text-center text-sm text-[#6B7280]"
          >
            {isSignup ? (
              <>
                قبلاً ثبت‌نام کرده‌اید؟{" "}
                <a
                  href={props.loginHref}
                  className="
                    font-medium
                    text-[#4F46E5]
                    transition
                    hover:text-[#4338CA]
                  "
                >
                  وارد شوید
                </a>
              </>
            ) : (
              <>
                هنوز حساب کاربری ندارید؟{" "}
                <a
                  href={props.createAccountHref}
                  className="
                    font-medium
                    text-[#4F46E5]
                    transition
                    hover:text-[#4338CA]
                  "
                >
                  ثبت‌نام کنید
                </a>
              </>
            )}
          </motion.p>

          {/* Footer */}

          <motion.p
            variants={itemVariants}
            className="mt-10 text-center text-[11px] leading-5 text-[#9CA3AF]"
          >
            با {isSignup ? "ایجاد حساب" : "ورود به حساب"}، با شرایط استفاده و
            حریم خصوصی موافقت می‌کنید.
          </motion.p>
        </motion.div>
      </div>

      {/* =========================
          BRAND PANEL
      ========================== */}

      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          className="object-cover"
          sizes="50vw"
        />

        {/* Overlay */}

        <div className="absolute inset-0 bg-[#111827]/35" />

        {/* Content */}

        <div className="absolute inset-0 flex items-end p-12 xl:p-16">
          <div className="max-w-lg text-white">
            {/* Small badge */}

            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 backdrop-blur-md">
                <CalendarDays className="h-5 w-5" />
              </div>

              <span className="text-sm font-medium text-white/90">
                مدیریت هوشمند آرایشگاه
              </span>
            </div>

            {/* Heading */}

            <h2 className="text-3xl font-bold leading-tight xl:text-4xl">
              همه چیز برای مدیریت بهتر
              <br />
              در یکجا.
            </h2>

            <p className="mt-4 max-w-md text-sm leading-7 text-white/75">
              مشتری‌ها، نوبت‌ها، خدمات و عملکرد کسب‌وکارتان را ساده‌تر و
              حرفه‌ای‌تر مدیریت کنید.
            </p>

            {/* Features */}

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                <Users className="mb-2 h-4 w-4 text-white/80" />

                <p className="text-xs text-white/70">
                  مدیریت مشتریان
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                <CalendarDays className="mb-2 h-4 w-4 text-white/80" />

                <p className="text-xs text-white/70">
                  رزرو و نوبت‌دهی
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                <TrendingUp className="mb-2 h-4 w-4 text-white/80" />

                <p className="text-xs text-white/70">
                  گزارش عملکرد
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}