"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import {
  phoneNumberSchema,
  registerSchema,
  type RegisterFormData,
} from "@/features/auth/schemas/auth.schema";
import { PasswordStrength } from "@/components/ui/password-strength";
import { Input } from "@/components/ui/input";
import { AuthBrandPanel } from "@/features/auth/components/auth-brand-panel";

const loginSchema = z.object({
  phoneNumber: phoneNumberSchema,

  password: z
    .string()
    .min(1, "رمز عبور را وارد کنید."),

  rememberMe: z.boolean().default(false),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = RegisterFormData;

type InternalFormValues = {
  name: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  rememberMe: boolean;
};

type CommonProps = {
  logo: React.ReactNode;
  title?: string;
  description?: string;
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
      phoneNumber: "",
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
          phoneNumber: data.phoneNumber,
          password: data.password,
          confirmPassword: data.confirmPassword,
        });
      } else {
        await props.onSubmit({
          phoneNumber: data.phoneNumber,
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

  return (
    <div
      dir="rtl"
      className="min-h-dvh w-full bg-white lg:grid lg:grid-cols-2"
    >
      {/* =========================
          FORM
      ========================== */}

      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-8 lg:px-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative w-full max-w-sm"
        >
          {/* Logo — mobile/tablet only; desktop shows the brand panel instead */}
          <motion.div variants={itemVariants} className="mb-8 lg:hidden">
            {logo}
          </motion.div>

          {/* Heading */}

          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-[28px] font-bold text-[#1e1b4b]">
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
                <Input
                  id="name"
                  label="نام"
                  type="text"
                  autoComplete="name"
                  placeholder="مثلاً علی رضایی"
                  disabled={isLoading}
                  error={form.formState.errors.name?.message}
                  {...form.register("name")}
                />
              </motion.div>
            )}

            {/* =========================
                PHONE NUMBER
            ========================== */}

            <motion.div variants={itemVariants}>
              <Input
                id="phoneNumber"
                label="شماره موبایل"
                type="tel"
                dir="ltr"
                autoComplete="tel"
                placeholder="09123456789"
                disabled={isLoading}
                error={form.formState.errors.phoneNumber?.message}
                {...form.register("phoneNumber")}
              />
            </motion.div>

            {/* =========================
                PASSWORD
            ========================== */}

            <motion.div variants={itemVariants}>
              <Input
                id="password"
                label="رمز عبور"
                type={showPassword ? "text" : "password"}
                dir="ltr"
                autoComplete={isSignup ? "new-password" : "current-password"}
                placeholder="••••••••"
                disabled={isLoading}
                error={form.formState.errors.password?.message}
                endIcon={
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
                      p-1
                      transition
                      hover:opacity-60
                      disabled:opacity-50
                    "
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
                {...form.register("password")}
              />

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
                <Input
                  id="confirmPassword"
                  label="تکرار رمز عبور"
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  disabled={isLoading}
                  error={form.formState.errors.confirmPassword?.message}
                  endIcon={
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
                        p-1
                        transition
                        hover:opacity-60
                        disabled:opacity-50
                      "
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                  {...form.register("confirmPassword")}
                />
              </motion.div>
            )}

            {/* =========================
                REMEMBER + FORGOT (login only)
            ========================== */}

            {/* {!isSignup && (
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
            )} */}

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

          {/* <motion.p
            variants={itemVariants}
            className="mt-10 text-center text-[11px] leading-5 text-[#9CA3AF]"
          >
            با {isSignup ? "ایجاد حساب" : "ورود به حساب"}، با شرایط استفاده و
            حریم خصوصی موافقت می‌کنید.
          </motion.p> */}
        </motion.div>
      </div>

      {/* =========================
          BRAND PANEL (pure code — no image)
      ========================== */}

      <AuthBrandPanel />
    </div>
  );
}