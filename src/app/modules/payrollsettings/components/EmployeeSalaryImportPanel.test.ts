import { describe, expect, it } from "vitest";
import { rowToImport } from "./salaryImportMapping";

describe("salary import row mapping", () => {
  it("normalizes spaced spreadsheet headers and maps employee salary fields", () => {
    const row = rowToImport({
      " Employee ID ": "EMP-42",
      " Basic Pay ": 85000,
      "HRA": 25000,
      "Effective From": new Date("2026-10-01T00:00:00.000Z"),
      "Payment Frequency": "Monthly",
    }, 2);

    expect(row.employeeId).toBe("EMP-42");
    expect(row.monthlyGross).toBe(110000);
    expect(row.annualCtc).toBe(1320000);
    expect(row.effectiveFrom).toBe("2026-10-01");
    expect(row.components.find((component) => component.componentCode === "BASIC")?.value).toBe(85000);
  });
});
