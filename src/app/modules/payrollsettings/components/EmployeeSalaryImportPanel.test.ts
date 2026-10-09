import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { hasExplicitSalaryComponentValue, invalidStandardSalaryValues, parseSalarySpreadsheet, rowToImport } from "./salaryImportMapping";

describe("salary import row mapping", () => {
  it("checks aggregate deductions without adding a second deduction line", () => {
    const row = rowToImport({ "Employee ID": "EMP-51", "Basic Pay": 30000, "Health Insurance": 500,
      "Loan Deduction": 1000, "Total Deductions": 1500 }, 2);
    expect(row.components.some((item) => item.componentCode === "TOTAL_DEDUCTIONS")).toBe(false);
    expect(row.components.filter((item) => item.kind === "DEDUCTION").reduce((sum, item) => sum + item.value, 0)).toBe(1500);
    expect(() => rowToImport({ "Basic Pay": 30000, "Health Insurance": 500, "Total Deductions": 1500 }, 3)).toThrow("itemize the difference");
    expect(() => rowToImport({ "Basic Pay": 30000, "Total Deductions": "invalid" }, 4)).toThrow("must match");
    expect(hasExplicitSalaryComponentValue({ "Employee ID": "EMP-51", "Total Deductions": 500 })).toBe(false);
  });
  it("normalizes spaced spreadsheet headers and maps employee salary fields", () => {
    const row = rowToImport({
      " Employee ID ": "EMP-42",
      " Basic Pay ": 85000,
      "HRA": 25000,
      "Health Insurance": 1000,
      "Effective From": new Date("2026-10-01T00:00:00.000Z"),
      "Payment Frequency": "Monthly",
    }, 2);

    expect(row.employeeId).toBe("EMP-42");
    expect(row.monthlyGross).toBe(110000);
    expect(row.annualCtc).toBe(1320000);
    expect(row.annualCtcSource).toBe("ANNUALIZED_GROSS_ESTIMATE");
    expect(row.effectiveFrom).toBe("2026-10-01");
    expect(row.components.find((component) => component.componentCode === "BASIC")?.value).toBe(85000);
    expect(row.components.find((component) => component.componentCode === "HEALTH_INSURANCE")).toMatchObject({ kind: "DEDUCTION", value: 1000 });
  });

  it("preserves an explicit annual CTC and marks its spreadsheet source, including zero for review", () => {
    const row = rowToImport({ "Employee ID": "EMP-52", "Basic Pay": 30000, "Annual CTC": 500000 }, 2);
    const explicitZero = rowToImport({ "Employee ID": "EMP-53", "Basic Pay": 30000, "Annual CTC": 0 }, 3);

    expect(row).toMatchObject({ annualCtc: 500000, annualCtcSource: "SPREADSHEET", monthlyGross: 30000 });
    expect(explicitZero).toMatchObject({ annualCtc: 0, annualCtcSource: "SPREADSHEET" });
  });

  it("parses India-style text effective dates day-first and rejects impossible dates", () => {
    const row = rowToImport({
      "Employee ID": "EMP-45",
      "Basic Pay": 50000,
      "Effective From": "01-09-2026",
      "Effective To": "30/09/2026",
    }, 5);
    const invalid = rowToImport({
      "Employee ID": "EMP-46",
      "Basic Pay": 50000,
      "Effective From": "31-02-2026",
    }, 6);

    expect(row.effectiveFrom).toBe("2026-09-01");
    expect(row.effectiveTo).toBe("2026-09-30");
    expect(invalid.effectiveFrom).toBe("");
  });

  it("keeps the effective calendar date from an actual XLSX date cell", () => {
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet([
      ["Employee ID", "Basic Pay", "Effective From"],
      ["EMP-47", 65000, new Date(Date.UTC(2026, 8, 1))],
    ], { cellDates: true });
    XLSX.utils.book_append_sheet(workbook, sheet, "Salaries");
    const bytes = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const parsed = XLSX.read(bytes, { type: "array", cellDates: true });
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(parsed.Sheets.Salaries, { defval: "" });

    expect(rowToImport(rows[0], 2).effectiveFrom).toBe("2026-09-01");
  });

  it("parses salary rows and reports empty or unreadable workbooks clearly", () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([["Employee ID", "Basic Pay"], ["EMP-48", 72000]]), "Salaries");
    const bytes = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

    expect(parseSalarySpreadsheet(bytes)[0]).toMatchObject({ employeeId: "EMP-48", monthlyGross: 72000 });
    expect(() => parseSalarySpreadsheet(new ArrayBuffer(0))).toThrow("file is empty");

    const emptyWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(emptyWorkbook, XLSX.utils.aoa_to_sheet([]), "Empty");
    expect(() => parseSalarySpreadsheet(XLSX.write(emptyWorkbook, { bookType: "xlsx", type: "array" }))).toThrow("no salary rows");
  });

  it("rejects rows with no explicit salary amount but allows an explicit zero", () => {
    expect(hasExplicitSalaryComponentValue({ "Employee ID": "EMP-49", "Effective From": "2026-10-01" })).toBe(false);
    expect(hasExplicitSalaryComponentValue({ "Employee ID": "EMP-50", "Basic Pay": 0 })).toBe(true);
    expect(invalidStandardSalaryValues({ "Basic Pay": "not disclosed", HRA: 12000 })).toEqual(["Basic Pay"]);
    expect(invalidStandardSalaryValues({ "Basic Pay": "₹85,000", HRA: 12000 })).toEqual([]);
  });

  it("preserves company-specific numeric salary and deduction columns", () => {
    const row = rowToImport({
      "Employee ID": "EMP-43",
      "Basic Pay": "₹85,000",
      "Shift Allowance": 4500,
      "Meal Deduction": 750,
      "PF": 1800,
    }, 3);

    expect(row.components.find((component) => component.componentCode === "SHIFT_ALLOWANCE")).toMatchObject({
      componentName: "Shift Allowance", kind: "EARNING", value: 4500,
    });
    expect(row.components.find((component) => component.componentCode === "MEAL_DEDUCTION")).toMatchObject({
      componentName: "Meal Deduction", kind: "DEDUCTION", value: 750,
    });
    expect(row.components.find((component) => component.componentCode === "PF")).toMatchObject({
      kind: "DEDUCTION", isStatutory: true, value: 1800,
    });
    expect(row.monthlyGross).toBe(89500);
  });

  it("preserves employee template, pay group, offer, and classification metadata", () => {
    const row = rowToImport({
      "Employee ID": "EMP-44",
      "User ID": "user-44",
      "Offer ID": "offer-9",
      "Offer Version": "3",
      "Salary Template ID": "template-senior",
      "Pay Group ID": "group-monthly",
      "Employee Type": "PERMANENT",
      "Grade ID": "G5",
      "Department ID": "engineering",
      "Basic Pay": 90000,
    }, 4);

    expect(row).toMatchObject({
      employeeId: "EMP-44",
      userId: "user-44",
      offerId: "offer-9",
      offerVersion: 3,
      salaryTemplateId: "template-senior",
      payGroupId: "group-monthly",
      employeeType: "PERMANENT",
      gradeId: "G5",
      departmentId: "engineering",
    });
  });
});
