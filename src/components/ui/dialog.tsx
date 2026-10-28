"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cn } from "cn";

/**
 * Styled wrappers around Base UI Dialog. Base UI owns focus trap, scroll
 * lock, escape/outside dismissal and ARIA wiring; we only apply the theme.
 * Enter/exit transitions are driven by `data-starting-style` /
 * `data-ending-style` attributes that Base UI toggles.
 */
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

function DialogContent({
  className,
  children,
  showClose = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Popup> & { showClose?: boolean }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop
        className="fixed inset-0 z-50 min-h-dvh bg-[#1e1b4b]/45 backdrop-blur-[2px] transition-opacity duration-200 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 supports-[-webkit-touch-callout:none]:absolute"
      />
      <DialogPrimitive.Viewport className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain p-4">
        <DialogPrimitive.Popup
          className={cn(
            "relative w-full max-w-lg rounded-[1.75rem] border border-border bg-surface p-6 text-[#1e1b4b] shadow-[0_30px_70px_-30px_rgba(30,27,75,0.5)] outline-none transition-[transform,opacity] duration-200 ease-out data-[starting-style]:translate-y-2 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0 data-[ending-style]:translate-y-1 data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 sm:p-7",
            className
          )}
          {...props}
        >
          {children}
          {showClose && (
            <DialogPrimitive.Close
              aria-label="بستن"
              className="absolute top-4 left-4 flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-surface-secondary hover:text-[#1e1b4b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.96]"
            >
              <X className="h-4.5 w-4.5" aria-hidden="true" />
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Viewport>
    </DialogPrimitive.Portal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5 pe-10", className)} {...props} />;
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn(
        "text-[19px] leading-7 font-extrabold tracking-tight text-[#1e1b4b]",
        className
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm leading-6 font-medium text-slate-600", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
};
