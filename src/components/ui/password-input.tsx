"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, type InputProps } from "./input";

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(
  function PasswordInput({ label, ...props }, ref) {
    const [show, setShow] = useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          label={label}
          type={show ? "text" : "password"}
          className="ps-10"
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "پنهان‌کردن رمز" : "نمایش رمز"}
          className="absolute end-3 top-[30px] text-muted hover:text-foreground"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    );
  }
);
