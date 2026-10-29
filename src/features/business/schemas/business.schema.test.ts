import { describe, expect, it } from "vitest";
import { businessSchema, toBusinessInput } from "./business.schema";

describe("businessSchema", () => {
  it("requires name, city, and address", () => {
    const result = businessSchema.safeParse({
      name: "",
      city: "",
      address: "",
      description: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("نام کسب‌وکار الزامی است.");
      expect(messages).toContain("شهر الزامی است.");
      expect(messages).toContain("نشانی الزامی است.");
    }
  });

  it("rejects oversized fields", () => {
    const result = businessSchema.safeParse({
      name: "ن".repeat(101),
      city: "تهران",
      address: "آدرس",
    });
    expect(result.success).toBe(false);
  });

  it("toBusinessInput trims and maps empty description to null", () => {
    expect(
      toBusinessInput({
        name: "  سالن  ",
        city: " تهران ",
        address: " ولیعصر ",
        description: "   ",
      }),
    ).toEqual({
      name: "سالن",
      city: "تهران",
      address: "ولیعصر",
      description: null,
    });
  });
});
