import { z } from "zod";
import {
  DURATION_MAX,
  DURATION_MIN,
  toAsciiDigits,
} from "@/features/service/schemas/service.schema";
import type {
  AssignServiceInput,
  EmployeeServiceDto,
  UpdateEmployeeServiceInput,
} from "@/features/employee/types";

const INTEGER_PATTERN = /^\d+$/;

const PRICE_ERROR = "قیمت باید عدد صحیح و نامنفی باشد.";
const DURATION_ERROR = `مدت زمان باید بین ${DURATION_MIN.toLocaleString(
  "fa-IR"
)} و ${DURATION_MAX.toLocaleString("fa-IR")} دقیقه باشد.`;
const DURATION_POSITIVE_ERROR = "مدت زمان باید عدد صحیح مثبت باشد.";

function isOptionalPrice(value: string): boolean {
  const raw = toAsciiDigits(value).trim();
  return raw === "" || INTEGER_PATTERN.test(raw);
}

function isOptionalDuration(value: string): boolean {
  const raw = toAsciiDigits(value).trim();
  if (raw === "") return true;
  if (!INTEGER_PATTERN.test(raw)) return false;
  const minutes = Number(raw);
  return minutes >= DURATION_MIN && minutes <= DURATION_MAX;
}

function isOptionalPositiveDuration(value: string): boolean {
  const raw = toAsciiDigits(value).trim();
  if (raw === "") return true;
  if (!INTEGER_PATTERN.test(raw)) return false;
  return Number(raw) > 0;
}

/**
 * One row per selected service. Empty override strings mean "inherit the
 * service default"; price and duration are validated independently so a user
 * can override only one of them.
 */
export const employeeServiceAssignmentSchema = z.object({
  selections: z.array(
    z.object({
      serviceId: z.number().int().positive(),
      price: z.string().refine(isOptionalPrice, PRICE_ERROR),
      durationMinutes: z.string().refine(isOptionalDuration, DURATION_ERROR),
    })
  ),
});

export type EmployeeServiceAssignmentFormData = z.infer<
  typeof employeeServiceAssignmentSchema
>;

export const EMPTY_SERVICE_SELECTION = {
  price: "",
  durationMinutes: "",
} as const;

/** Drops empty overrides entirely so the API inherits the service defaults. */
export function toAssignServiceInputs(
  data: EmployeeServiceAssignmentFormData
): AssignServiceInput[] {
  return data.selections.map(({ serviceId, price, durationMinutes }) => {
    const priceRaw = toAsciiDigits(price).trim();
    const durationRaw = toAsciiDigits(durationMinutes).trim();
    return {
      serviceId,
      ...(priceRaw !== "" ? { priceOverride: Number(priceRaw) } : {}),
      ...(durationRaw !== ""
        ? { durationMinutesOverride: Number(durationRaw) }
        : {}),
    };
  });
}

/**
 * Edit-override form. An empty string means "inherit the salon default"
 * (reset). A filled value is an intentional custom override. Price and
 * duration stay independent so one can be reset without touching the other.
 */
export const employeeServiceOverrideSchema = z.object({
  price: z.string().refine(isOptionalPrice, PRICE_ERROR),
  durationMinutes: z
    .string()
    .refine(isOptionalPositiveDuration, DURATION_POSITIVE_ERROR),
});

export type EmployeeServiceOverrideFormData = z.infer<
  typeof employeeServiceOverrideSchema
>;

/** Seeds the edit form from the current employee-service overrides. */
export function toOverrideFormValues(
  service: Pick<
    EmployeeServiceDto,
    "priceOverride" | "durationMinutesOverride"
  >
): EmployeeServiceOverrideFormData {
  return {
    price:
      service.priceOverride == null ? "" : String(service.priceOverride),
    durationMinutes:
      service.durationMinutesOverride == null
        ? ""
        : String(service.durationMinutesOverride),
  };
}

/**
 * Builds a sparse PUT body: only intentionally changed fields are included.
 * Empty form values map to `null` (clear override) when the original had a
 * custom value; unchanged fields are omitted entirely.
 */
export function toUpdateEmployeeServiceInput(
  data: EmployeeServiceOverrideFormData,
  original: Pick<
    EmployeeServiceDto,
    "priceOverride" | "durationMinutesOverride"
  >
): UpdateEmployeeServiceInput {
  const patch: UpdateEmployeeServiceInput = {};

  const priceRaw = toAsciiDigits(data.price).trim();
  const nextPrice = priceRaw === "" ? null : Number(priceRaw);
  if (nextPrice !== original.priceOverride) {
    patch.priceOverride = nextPrice;
  }

  const durationRaw = toAsciiDigits(data.durationMinutes).trim();
  const nextDuration = durationRaw === "" ? null : Number(durationRaw);
  if (nextDuration !== original.durationMinutesOverride) {
    patch.durationMinutesOverride = nextDuration;
  }

  return patch;
}
