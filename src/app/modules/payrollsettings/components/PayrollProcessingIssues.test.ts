import { describe, expect, it } from "vitest";
import { payrollProcessingFailure } from "./PayrollProcessingIssues";

describe("payroll processing error presentation", () => {
  it("preserves structured employee errors", () => {
    expect(payrollProcessingFailure({ message: "Blocked", errors: [{ field: "EMP1", message: "Policy changes mid-month" }] }))
      .toEqual({ message: "Blocked", issues: [{ field: "EMP1", message: "Policy changes mid-month" }] });
  });
  it("converts a legacy long toast into a concise summary and separate issues", () => {
    const details = Array.from({ length: 100 }, (_, i) => `EMP${i}: approved payroll policy changes within this pay period`).join("; ");
    const failure = payrollProcessingFailure({ message: "Payroll validation failed. No payroll records were changed. " + details });
    expect(failure.issues).toHaveLength(100);
    expect(failure.message).toBe("Payroll validation failed. No payroll records were changed.");
    expect(failure.issues[99].field).toBe("EMP99");
  });
  it("handles missing error metadata without losing useful messages", () => {
    expect(payrollProcessingFailure({ errors: [{ message: "Attendance must be locked" }, {}] }).issues)
      .toEqual([{ field: "Payroll", message: "Attendance must be locked" }]);
    expect(payrollProcessingFailure({ message: "Permission denied" })).toEqual({ message: "Permission denied", issues: [] });
  });
});
