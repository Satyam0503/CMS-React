import { describe, expect, it } from "vitest";
import { isValidCurrencyInput } from "./currencyInput";

describe("currency input validation", () => {
  it("accepts whole, decimal, empty, and existing negative numeric values", () => {
    expect(isValidCurrencyInput("50000")).toBe(true);
    expect(isValidCurrencyInput("50000.50")).toBe(true);
    expect(isValidCurrencyInput("")).toBe(true);
    expect(isValidCurrencyInput("-100")).toBe(true);
  });

  it("rejects commas and non-numeric input", () => {
    expect(isValidCurrencyInput("50,000")).toBe(false);
    expect(isValidCurrencyInput("50000abc")).toBe(false);
  });
});
