import type { EmployeeSalaryImportRowModel } from "../../payroll/models";

const normalize = (value: unknown) => String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
const numberValue = (value: unknown) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};
const dateValue = (value: unknown) => {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const parsed = new Date(String(value ?? ""));
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
};

export const rowToImport = (row: Record<string, unknown>, rowNumber: number): EmployeeSalaryImportRowModel => {
  const values = new Map(Object.entries(row).map(([key, value]) => [normalize(key), value]));
  const component = (code: string, name: string, key: string, kind: "EARNING" | "DEDUCTION" = "EARNING") => ({
    componentCode: code,
    componentName: name,
    kind,
    value: numberValue(values.get(normalize(key))),
    calculationType: "FIXED",
    isTaxable: kind === "EARNING",
    isRecurring: true,
    isStatutory: false,
    isEmployerContribution: false,
  });
  const components = [
    component("BASIC", "Basic Pay", "Basic Pay"),
    component("HRA", "HRA", "HRA"),
    component("LTA", "LTA", "LTA"),
    component("OTHER_ALLOWANCE", "Other Allowance", "Other Allowance"),
    component("BONUS", "Bonus", "Bonus"),
    component("HEALTH_INSURANCE", "Health Insurance", "Health Insurance"),
    component("TOTAL_DEDUCTIONS", "Total Deductions", "Total Deductions", "DEDUCTION"),
  ];
  const monthlyGross = components
    .filter((item) => item.kind === "EARNING")
    .reduce((total, item) => total + item.value, 0);

  return {
    rowNumber,
    employeeId: String(values.get("employee id") ?? "").trim(),
    currency: String(values.get("currency") ?? "INR"),
    paymentFrequency: String(values.get("payment frequency") ?? "MONTHLY"),
    annualCtc: numberValue(values.get("annual ctc")) || monthlyGross * 12,
    monthlyGross,
    effectiveFrom: dateValue(values.get("effective from")),
    effectiveTo: values.get("effective to") ? dateValue(values.get("effective to")) : null,
    components,
  };
};
