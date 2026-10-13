import { describe, expect, it, vi } from "vitest";
import * as XLSX from "xlsx";
import {
  generatePayrollBulkSampleWorkbook,
  generateEmployeeSalarySampleWorkbook,
  rowToImport,
} from "./salaryImportMapping";

describe("salaryImportMapping sample template generation and parsing", () => {
  it("generates a sample workbook prefilled with employee payroll components", () => {
    const workbook = generateEmployeeSalarySampleWorkbook({
      employeeId: "EMP1001",
      employeeName: "Aarav Sharma",
      basicPay: 120000,
      hra: 24000,
      lta: 5000,
      otherAllowance: 10000,
      bonus: 5000,
      healthInsurance: 2000,
      effectiveFrom: "2026-08-01",
      effectiveTo: "2027-07-31",
      customComponents: [
        { code: "MEAL", name: "Meal", value: 1500 },
        { code: "TRAVEL", name: "Travel", value: 2500 },
      ],
    });

    expect(workbook.SheetNames).toContain("Salary Structure");
    const sheet = workbook.Sheets["Salary Structure"];
    expect(sheet).toBeDefined();

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet!);
    expect(rows).toHaveLength(1);

    const row = rows[0]!;
    expect(row["Employee ID"]).toBe("EMP1001");
    expect(row["Employee Name"]).toBe("Aarav Sharma");
    expect(row["Basic Pay"]).toBe(120000);
    expect(row["HRA"]).toBe(24000);
    expect(row["LTA"]).toBe(5000);
    expect(row["Other Allowance"]).toBe(10000);
    expect(row["Bonus"]).toBe(5000);
    expect(row["Health Insurance"]).toBe(2000);
    expect(row["Meal"]).toBe(1500);
    expect(row["Travel"]).toBe(2500);
    expect(row["Effective From"]).toBe("2026-08-01");
    expect(row["Effective To"]).toBe("2027-07-31");
    expect(row["Payment Frequency"]).toBe("Monthly");
  });

  it("roundtrips sample template rows through rowToImport without errors", () => {
    const workbook = generateEmployeeSalarySampleWorkbook({
      employeeId: "EMP1001",
      employeeName: "Aarav Sharma",
      basicPay: 120000,
      hra: 24000,
      lta: 5000,
      otherAllowance: 10000,
      bonus: 5000,
      healthInsurance: 2000,
      effectiveFrom: "2026-08-01",
      customComponents: [{ name: "Meal", value: 1500 }],
    });

    const sheet = workbook.Sheets["Salary Structure"]!;
    const [sourceRow] = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
    expect(sourceRow).toBeDefined();

    const imported = rowToImport(sourceRow!, 2);
    expect(imported.employeeId).toBe("EMP1001");
    expect(imported.effectiveFrom).toBe("2026-08-01");
    expect(imported.paymentFrequency).toBe("Monthly");

    const basic = imported.components.find((c) => c.componentCode === "BASIC");
    const hra = imported.components.find((c) => c.componentCode === "HRA");
    const healthIns = imported.components.find((c) => c.componentCode === "HEALTH_INSURANCE");
    const meal = imported.components.find((c) => c.componentCode === "MEAL");

    expect(basic?.value).toBe(120000);
    expect(hra?.value).toBe(24000);
    expect(healthIns?.value).toBe(2000);
    expect(healthIns?.kind).toBe("DEDUCTION");
    expect(meal?.value).toBe(1500);
    expect(meal?.kind).toBe("EARNING");
  });

  it("formats column widths and headers properly for professional Excel view", () => {
    const workbook = generateEmployeeSalarySampleWorkbook({
      employeeId: "EMP1001",
      employeeName: "Aarav Sharma",
      basicPay: 120000,
    });

    const sheet = workbook.Sheets["Salary Structure"]!;
    expect(sheet["!cols"]).toBeDefined();
    expect(sheet["!cols"]!.length).toBeGreaterThanOrEqual(10);
    // Every column has a minimum width
    sheet["!cols"]!.forEach((col) => {
      expect(col.wch).toBeGreaterThanOrEqual(14);
    });
  });

  it("generates a bulk sample template demonstrating multiple diverse employee salary structures", () => {
    const workbook = generatePayrollBulkSampleWorkbook();
    expect(workbook).toBeDefined();
    const sheet = workbook.Sheets["Payroll Salaries"]!;
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
    expect(rows).toHaveLength(3);

    const parsedRows = rows.map((r, i) => rowToImport(r, i + 2));
    expect(parsedRows[0].employeeId).toBe("EMP1001");
    expect(parsedRows[1].employeeId).toBe("EMP1002");
    expect(parsedRows[2].employeeId).toBe("EMP1003");

    // Verify each employee has a different salary structure
    // EMP1001: Technical lead with high basic & special allowance
    expect(parsedRows[0].components.find((c) => c.componentCode === "SPECIAL_ALLOWANCE")?.value).toBe(20000);
    expect(parsedRows[0].components.find((c) => c.componentCode === "BONUS")?.value).toBe(0);

    // EMP1002: Sales manager with bonus/incentive
    expect(parsedRows[1].components.find((c) => c.componentCode === "BONUS")?.value).toBe(15000);

    // EMP1003: Operations associate with standard other allowance and 0 special allowance
    expect(parsedRows[2].components.find((c) => c.componentCode === "SPECIAL_ALLOWANCE")?.value).toBe(0);
    expect(parsedRows[2].components.find((c) => c.componentCode === "OTHER_ALLOWANCE")?.value).toBe(11000);
  });
});

