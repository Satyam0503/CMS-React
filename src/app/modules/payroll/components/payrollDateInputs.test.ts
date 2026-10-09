import { describe, expect, it } from "vitest";
import { currentMonthEndInputValue, currentMonthStartInputValue, nextLocalDateInputValue, toLocalDateInputValue } from "./payrollDateInputs";

describe("payroll date-only input defaults", () => {
  it("formats the local calendar date without converting it through UTC", () => {
    expect(toLocalDateInputValue(new Date(2026, 9, 5, 0, 15))).toBe("2026-10-05");
  });

  it("computes first and last month days using local calendar boundaries", () => {
    const now = new Date(2024, 1, 29, 0, 15);
    expect(currentMonthStartInputValue(now)).toBe("2024-02-01");
    expect(currentMonthEndInputValue(now)).toBe("2024-02-29");
  });

  it("advances pay date across local month and year boundaries", () => {
    expect(nextLocalDateInputValue(new Date(2026, 11, 31, 0, 15))).toBe("2027-01-01");
  });
});
