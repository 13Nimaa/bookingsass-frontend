"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "cn";

/**
 * Styled wrappers around Base UI Select. Portal + high z-index so the menu
 * works inside dialogs; `alignItemWithTrigger` defaults off so the popup
 * sits below the trigger (better in modals / short viewports).
 */

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const triggerClassName =
  "flex h-12 w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3 text-[15px] font-medium text-text-primary outline-none transition-all duration-150 hover:border-border-strong focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 data-popup-open:border-primary data-popup-open:ring-2 data-popup-open:ring-primary/15 disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:opacity-60 aria-invalid:border-error aria-invalid:focus-visible:ring-error-soft";

function SelectTrigger({
  className,
  children,
  ...props
}: SelectPrimitive.Trigger.Props) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn("group/select", triggerClassName, className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        data-slot="select-icon"
        className="flex shrink-0 text-muted transition-transform duration-200 group-data-popup-open/select:rotate-180 group-data-popup-open/select:text-primary"
      >
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

type SelectContentProps = SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "sideOffset" | "alignItemWithTrigger" | "side" | "align"
  >;

function SelectContent({
  className,
  children,
  sideOffset = 6,
  alignItemWithTrigger = false,
  side,
  align,
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        className="z-[70] outline-none"
        sideOffset={sideOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        side={side}
        align={align}
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "w-[var(--anchor-width)] origin-[var(--transform-origin)] overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_16px_36px_-20px_rgba(34,31,28,0.28)] outline-none transition-[transform,opacity] duration-150 ease-out data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0 data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0",
            className,
          )}
          {...props}
        >
          <SelectPrimitive.ScrollUpArrow className="flex h-8 w-full cursor-default items-center justify-center bg-surface text-muted">
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          </SelectPrimitive.ScrollUpArrow>
          <SelectPrimitive.List
            data-slot="select-list"
            className="max-h-60 w-full scroll-py-1 overflow-y-auto overscroll-contain p-1.5 outline-none"
          >
            {children}
          </SelectPrimitive.List>
          <SelectPrimitive.ScrollDownArrow className="flex h-8 w-full cursor-default items-center justify-center bg-surface text-muted">
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </SelectPrimitive.ScrollDownArrow>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex min-h-10 cursor-default items-center gap-2 rounded-xl px-3 py-2 text-[15px] font-semibold text-text-primary outline-none select-none data-highlighted:bg-primary-soft data-highlighted:text-primary data-disabled:pointer-events-none data-disabled:opacity-40",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex-1 truncate">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="flex shrink-0 text-primary">
        <Check className="h-4 w-4" aria-hidden="true" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.Label.Props) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(
        "mb-1.5 block text-[13px] font-bold text-text-primary",
        className,
      )}
      {...props}
    />
  );
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("my-1 h-px bg-border-subtle", className)}
      {...props}
    />
  );
}

export type SelectOption = {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
};

export type SelectFieldProps = {
  label?: string;
  options: ReadonlyArray<SelectOption | string>;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  dir?: "ltr" | "rtl";
  className?: string;
  triggerClassName?: string;
  name?: string;
  id?: string;
  /** Nested dialogs: keep false (default) so the parent modal keeps scroll/focus. */
  modal?: boolean;
  error?: string;
  required?: boolean;
};

function normalizeOptions(
  options: ReadonlyArray<SelectOption | string>,
): SelectOption[] {
  return options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );
}

/**
 * Labeled single-select for forms. Prefer this over composing parts unless
 * you need groups, custom item layout, or multi-select.
 */
function SelectField({
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "انتخاب کنید",
  disabled,
  dir,
  className,
  triggerClassName,
  name,
  id,
  modal = false,
  error,
  required,
}: SelectFieldProps) {
  const items = React.useMemo(() => normalizeOptions(options), [options]);
  const itemRecords = React.useMemo(
    () => items.map(({ value: optionValue, label: optionLabel }) => ({
      value: optionValue,
      label: optionLabel,
    })),
    [items],
  );

  return (
    <div className={cn("flex w-full flex-col", className)} dir={dir}>
      <Select
        value={value}
        defaultValue={defaultValue}
        onValueChange={(next) => {
          if (next != null) onValueChange?.(next);
        }}
        disabled={disabled}
        name={name}
        id={id}
        modal={modal}
        items={itemRecords}
        required={required}
      >
        {label ? <SelectLabel>{label}</SelectLabel> : null}
        <SelectTrigger
          className={cn(dir === "ltr" && "font-semibold", triggerClassName)}
          aria-invalid={error ? true : undefined}
        >
          <SelectValue placeholder={placeholder} className="tnum truncate" />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem
              key={item.value}
              value={item.value}
              disabled={item.disabled}
              label={typeof item.label === "string" ? item.label : item.value}
              className={dir === "ltr" ? "tnum" : undefined}
            >
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? (
        <p className="mt-1.5 text-[13px] font-bold leading-5 text-error-text">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectGroup,
  SelectSeparator,
  SelectField,
};
