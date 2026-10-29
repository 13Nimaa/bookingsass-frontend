import { describe, expect, it } from "vitest";
import { loginSchema, phoneNumberSchema, registerSchema } from "./auth.schema";

describe("auth schemas", () => {
  it("normalizes Iranian phone formats to 09xxxxxxxxx", () => {
    expect(phoneNumberSchema.parse("+989123456789")).toBe("09123456789");
    expect(phoneNumberSchema.parse("9123456789")).toBe("09123456789");
    expect(phoneNumberSchema.parse("09123456789")).toBe("09123456789");
  });

  it("rejects malformed phones", () => {
    expect(() => phoneNumberSchema.parse("12345")).toThrow();
  });

  it("login requires password", () => {
    const result = loginSchema.safeParse({
      phoneNumber: "09123456789",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("register validates password rules and confirm match", () => {
    const weak = registerSchema.safeParse({
      name: "Ali",
      phoneNumber: "09123456789",
      password: "short",
      confirmPassword: "short",
    });
    expect(weak.success).toBe(false);

    const mismatch = registerSchema.safeParse({
      name: "Ali",
      phoneNumber: "09123456789",
      password: "Password1",
      confirmPassword: "Password2",
    });
    expect(mismatch.success).toBe(false);

    const ok = registerSchema.safeParse({
      name: "Ali",
      phoneNumber: "09123456789",
      password: "Password1",
      confirmPassword: "Password1",
    });
    expect(ok.success).toBe(true);
  });
});
