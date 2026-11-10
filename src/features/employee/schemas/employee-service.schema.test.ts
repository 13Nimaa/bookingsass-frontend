import { describe, expect, it } from "vitest";
import {
  employeeServiceAssignmentSchema,
  employeeServiceOverrideSchema,
  toAssignServiceInputs,
  toOverrideFormValues,
  toUpdateEmployeeServiceInput,
} from "@/features/employee/schemas/employee-service.schema";

function selection(overrides: Partial<{ price: string; durationMinutes: string }> = {}) {
  return {
    selections: [
      {
        serviceId: 1,
        price: "",
        durationMinutes: "",
        ...overrides,
      },
    ],
  };
}

function parse(input: ReturnType<typeof selection>) {
  const result = employeeServiceAssignmentSchema.safeParse(input);
  if (!result.success) throw new Error("expected valid form data");
  return result.data;
}

describe("employeeServiceAssignmentSchema", () => {
  it("omits both overrides when the fields are empty", () => {
    expect(toAssignServiceInputs(parse(selection()))).toEqual([
      { serviceId: 1 },
    ]);
  });

  it("maps a price override without a duration override", () => {
    expect(
      toAssignServiceInputs(parse(selection({ price: "150000" })))
    ).toEqual([{ serviceId: 1, priceOverride: 150000 }]);
  });

  it("maps a duration override without a price override", () => {
    expect(
      toAssignServiceInputs(parse(selection({ durationMinutes: "45" })))
    ).toEqual([{ serviceId: 1, durationMinutesOverride: 45 }]);
  });

  it("accepts Persian digits and separators for both overrides", () => {
    expect(
      toAssignServiceInputs(
        parse(selection({ price: "۱۲۵٬۰۰۰", durationMinutes: "۳۰" }))
      )
    ).toEqual([
      { serviceId: 1, priceOverride: 125000, durationMinutesOverride: 30 },
    ]);
  });

  it("allows a zero price override", () => {
    expect(toAssignServiceInputs(parse(selection({ price: "0" })))).toEqual([
      { serviceId: 1, priceOverride: 0 },
    ]);
  });

  it("treats whitespace-only overrides as empty", () => {
    expect(
      toAssignServiceInputs(
        parse(selection({ price: "   ", durationMinutes: "  " }))
      )
    ).toEqual([{ serviceId: 1 }]);
  });

  it("rejects a non-numeric or negative price", () => {
    expect(employeeServiceAssignmentSchema.safeParse(selection({ price: "12a" })).success).toBe(false);
    expect(employeeServiceAssignmentSchema.safeParse(selection({ price: "-1" })).success).toBe(false);
  });

  it("enforces the duration bounds", () => {
    expect(
      employeeServiceAssignmentSchema.safeParse(selection({ durationMinutes: "4" }))
        .success
    ).toBe(false);
    expect(
      employeeServiceAssignmentSchema.safeParse(
        selection({ durationMinutes: "241" })
      ).success
    ).toBe(false);
    expect(
      employeeServiceAssignmentSchema.safeParse(selection({ durationMinutes: "5" }))
        .success
    ).toBe(true);
    expect(
      employeeServiceAssignmentSchema.safeParse(
        selection({ durationMinutes: "240" })
      ).success
    ).toBe(true);
  });
});

describe("employeeServiceOverrideSchema", () => {
  const original = {
    priceOverride: 120000 as number | null,
    durationMinutesOverride: 45 as number | null,
  };

  it("seeds empty strings when overrides are inherited", () => {
    expect(
      toOverrideFormValues({
        priceOverride: null,
        durationMinutesOverride: null,
      })
    ).toEqual({ price: "", durationMinutes: "" });
  });

  it("seeds the current override values when custom", () => {
    expect(toOverrideFormValues(original)).toEqual({
      price: "120000",
      durationMinutes: "45",
    });
  });

  it("omits unchanged fields from the PUT body", () => {
    expect(
      toUpdateEmployeeServiceInput(
        { price: "120000", durationMinutes: "45" },
        original
      )
    ).toEqual({});
  });

  it("sends only a changed price override", () => {
    expect(
      toUpdateEmployeeServiceInput(
        { price: "150000", durationMinutes: "45" },
        original
      )
    ).toEqual({ priceOverride: 150000 });
  });

  it("sends only a changed duration override", () => {
    expect(
      toUpdateEmployeeServiceInput(
        { price: "120000", durationMinutes: "60" },
        original
      )
    ).toEqual({ durationMinutesOverride: 60 });
  });

  it("sends null to reset price without touching duration", () => {
    expect(
      toUpdateEmployeeServiceInput(
        { price: "", durationMinutes: "45" },
        original
      )
    ).toEqual({ priceOverride: null });
  });

  it("sends null to reset duration without touching price", () => {
    expect(
      toUpdateEmployeeServiceInput(
        { price: "120000", durationMinutes: "" },
        original
      )
    ).toEqual({ durationMinutesOverride: null });
  });

  it("sends an explicit custom price when previously inherited", () => {
    expect(
      toUpdateEmployeeServiceInput(
        { price: "150000", durationMinutes: "" },
        { priceOverride: null, durationMinutesOverride: null }
      )
    ).toEqual({ priceOverride: 150000 });
  });

  it("allows a zero price override and rejects non-positive duration", () => {
    expect(
      employeeServiceOverrideSchema.safeParse({
        price: "0",
        durationMinutes: "",
      }).success
    ).toBe(true);
    expect(
      employeeServiceOverrideSchema.safeParse({
        price: "",
        durationMinutes: "0",
      }).success
    ).toBe(false);
    expect(
      employeeServiceOverrideSchema.safeParse({
        price: "",
        durationMinutes: "30",
      }).success
    ).toBe(true);
  });

  it("accepts Persian digits when building the patch", () => {
    expect(
      toUpdateEmployeeServiceInput(
        { price: "۱۳۰۰۰۰", durationMinutes: "۵۰" },
        original
      )
    ).toEqual({
      priceOverride: 130000,
      durationMinutesOverride: 50,
    });
  });
});
