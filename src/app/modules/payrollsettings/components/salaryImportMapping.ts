import type { EmployeeSalaryImportRowModel } from "../../payroll/models";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

const normalize = (value: unknown) => String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
const numberValue = (value: unknown) => {
  const normalized = typeof value === "string" ? value.replace(/[₹,$\s]/g, "") : value;
  const parsed = Number(normalized ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};
const datePartsValue = (year: number, month: number, day: number) => {
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) return "";
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};
const dateValue = (value: unknown) => {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? "" : value.toISOString().slice(0, 10);
  const text = String(value ?? "").trim();
  const isoDate = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text);
  if (isoDate) return datePartsValue(Number(isoDate[1]), Number(isoDate[2]), Number(isoDate[3]));
  // Text dates in this India-focused payroll UI use the familiar day-first form.
  // Excel date cells arrive as Date objects and retain their serial calendar date above.
  const dayFirstDate = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(text);
  if (dayFirstDate) return datePartsValue(Number(dayFirstDate[3]), Number(dayFirstDate[2]), Number(dayFirstDate[1]));
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
};
const textValue = (values: Map<string, unknown>, key: string) => {
  const value = String(values.get(normalize(key)) ?? "").trim();
  return value || undefined;
};
const optionalNumberValue = (values: Map<string, unknown>, key: string) => {
  const value = values.get(normalize(key));
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
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
    component("HEALTH_INSURANCE", "Health Insurance", "Health Insurance", "DEDUCTION"),
  ];
  const reservedHeaders = new Set([
    "employee id", "employee code", "currency", "payment frequency", "annual ctc", "monthly gross",
    "effective from", "effective to", "employee type", "offer id", "offer version", "salary template id",
    "pay group id", "grade id", "department id", "user id", "basic pay", "hra", "lta", "other allowance",
    "bonus", "health insurance", "total deductions",
  ]);
  for (const [header, rawValue] of Object.entries(row)) {
    const name = header.trim();
    const normalizedHeader = normalize(name);
    if (!name || reservedHeaders.has(normalizedHeader) || rawValue === "" || rawValue == null) continue;
    const numericValue = numberValue(rawValue);
    if (!Number.isFinite(numericValue)) continue;
    const code = normalizedHeader.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "");
    if (!code || components.some((item) => item.componentCode === code)) continue;
    const deduction = /deduction|loan|advance|tax|tds|\bpf\b|\besic\b/.test(normalizedHeader);
    components.push({
      componentCode: code,
      componentName: name,
      kind: deduction ? "DEDUCTION" : "EARNING",
      value: numericValue,
      calculationType: "FIXED",
      isTaxable: !deduction,
      isRecurring: true,
      isStatutory: deduction && /(^|\b)(pf|epf|esic|tds|professional tax|pt)(\b|$)/.test(normalizedHeader),
      isEmployerContribution: false,
    });
  }
  const statedDeductions = values.get("total deductions");
  if (statedDeductions != null && String(statedDeductions).trim() !== "") {
    const parsedTotal = Number(typeof statedDeductions === "string" ? statedDeductions.replace(/[,\s]/g, "").replace("\u20b9", "") : statedDeductions);
    const itemizedTotal = components.filter((item) => item.kind === "DEDUCTION").reduce((sum, item) => sum + item.value, 0);
    if (!Number.isFinite(parsedTotal) || Math.round(parsedTotal * 100) !== Math.round(itemizedTotal * 100)) {
      throw new Error(`Row ${rowNumber}: Total Deductions must match the itemized deductions. Review and itemize the difference before importing.`);
    }
  }
  const monthlyGross = components
    .filter((item) => item.kind === "EARNING")
    .reduce((total, item) => total + item.value, 0);
  const statedAnnualCtc = optionalNumberValue(values, "annual ctc");

  return {
    rowNumber,
    employeeId: String(values.get("employee id") ?? "").trim(),
    userId: textValue(values, "user id"),
    offerId: textValue(values, "offer id"),
    offerVersion: optionalNumberValue(values, "offer version"),
    salaryTemplateId: textValue(values, "salary template id"),
    payGroupId: textValue(values, "pay group id"),
    employeeType: textValue(values, "employee type"),
    gradeId: textValue(values, "grade id"),
    departmentId: textValue(values, "department id"),
    currency: String(values.get("currency") ?? "INR"),
    paymentFrequency: String(values.get("payment frequency") ?? "MONTHLY"),
    annualCtc: statedAnnualCtc ?? monthlyGross * 12,
    annualCtcSource: statedAnnualCtc !== undefined ? "SPREADSHEET" : "ANNUALIZED_GROSS_ESTIMATE",
    monthlyGross,
    effectiveFrom: dateValue(values.get("effective from")),
    effectiveTo: values.get("effective to") ? dateValue(values.get("effective to")) : null,
    components,
  };
};

export const hasExplicitSalaryComponentValue = (row: Record<string, unknown>) => {
  const reservedHeaders = new Set([
    "employee id", "employee code", "user id", "currency", "payment frequency", "annual ctc", "monthly gross",
    "effective from", "effective to", "employee type", "offer id", "offer version", "salary template id",
    "pay group id", "grade id", "department id", "total deductions",
  ]);
  return Object.entries(row).some(([header, rawValue]) => {
    if (rawValue == null || String(rawValue).trim() === "" || reservedHeaders.has(normalize(header))) return false;
    const normalizedValue = typeof rawValue === "string" ? rawValue.replace(/[₹,$\s]/g, "") : rawValue;
    return Number.isFinite(Number(normalizedValue));
  });
};

export const invalidStandardSalaryValues = (row: Record<string, unknown>) => {
  const standardSalaryHeaders = new Set([
    "basic pay", "hra", "lta", "other allowance", "bonus", "health insurance", "total deductions",
  ]);
  return Object.entries(row)
    .filter(([header, rawValue]) => standardSalaryHeaders.has(normalize(header)) && rawValue != null && String(rawValue).trim() !== "")
    .filter(([, rawValue]) => {
      const normalizedValue = typeof rawValue === "string" ? rawValue.replace(/[₹,$\s]/g, "") : rawValue;
      return !Number.isFinite(Number(normalizedValue));
    })
    .map(([header]) => header.trim());
};

export const parseSalarySpreadsheet = (content: ArrayBuffer): EmployeeSalaryImportRowModel[] => {
  if (content.byteLength === 0) throw new Error("The spreadsheet file is empty.");
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(content, { type: "array", cellDates: true });
  } catch {
    throw new Error("The spreadsheet could not be read. Upload a valid Excel file.");
  }
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) throw new Error("The spreadsheet has no worksheets.");
  const sheet = workbook.Sheets[firstSheetName];
  if (!sheet) throw new Error("The first spreadsheet worksheet could not be read.");
  const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  if (data.length === 0) throw new Error("The spreadsheet contains no salary rows.");
  return data.map((row, index) => {
    const rowNumber = index + 2;
    const invalidValues = invalidStandardSalaryValues(row);
    if (invalidValues.length > 0) {
      throw new Error(`Row ${rowNumber} contains invalid numeric values for: ${invalidValues.join(", ")}.`);
    }
    if (!hasExplicitSalaryComponentValue(row)) {
      throw new Error(`Row ${rowNumber} must include at least one numeric salary component value.`);
    }
    return rowToImport(row, rowNumber);
  });
};

export type SampleEmployeeSalaryData = {
  employeeId: string;
  employeeName?: string;
  basicPay?: number;
  hra?: number;
  lta?: number;
  otherAllowance?: number;
  bonus?: number;
  healthInsurance?: number;
  effectiveFrom?: string | Date;
  effectiveTo?: string | Date | null;
  customComponents?: Array<{ code?: string; name: string; value?: number }>;
};

export const generateEmployeeSalarySampleWorkbook = (params: SampleEmployeeSalaryData): XLSX.WorkBook => {
  const row: Record<string, string | number> = {
    "Employee ID": params.employeeId,
    "Employee Name": params.employeeName ?? "",
    "Basic Pay": params.basicPay ?? 0,
    "HRA": params.hra ?? 0,
    "LTA": params.lta ?? 0,
    "Other Allowance": params.otherAllowance ?? 0,
    "Bonus": params.bonus ?? 0,
    "Health Insurance": params.healthInsurance ?? 0,
  };

  if (params.customComponents && params.customComponents.length > 0) {
    for (const comp of params.customComponents) {
      if (comp.name) {
        row[comp.name] = comp.value ?? 0;
      }
    }
  }

  const effectiveFrom = params.effectiveFrom
    ? dayjs(params.effectiveFrom).format("YYYY-MM-DD")
    : dayjs().format("YYYY-MM-DD");

  const effectiveTo = params.effectiveTo
    ? dayjs(params.effectiveTo).format("YYYY-MM-DD")
    : "";

  row["Effective From"] = effectiveFrom;
  row["Effective To"] = effectiveTo;
  row["Payment Frequency"] = "Monthly";

  const worksheet = XLSX.utils.json_to_sheet([row]);
  worksheet["!cols"] = Object.keys(row).map((header) => ({
    wch: Math.max(header.length + 4, 14),
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Salary Structure");
  return workbook;
};

export const downloadEmployeeSalarySampleTemplate = (params: SampleEmployeeSalaryData) => {
  const workbook = generateEmployeeSalarySampleWorkbook(params);
  const safeId = (params.employeeId || "template").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
  XLSX.writeFile(workbook, `Salary_Template_${safeId}.xlsx`);
};

export const downloadPayrollBulkSampleTemplate = (
  employees: Array<{
    employeeId: string;
    employeeName: string;
    activeSalary?: {
      basicPay?: number;
      hra?: number;
      lta?: number;
      otherAllowance?: number;
      bonus?: number;
      healthInsurance?: number;
      effectiveFrom?: unknown;
      effectiveTo?: unknown;
    } | null;
  }>,
  customComponents?: Array<{ code?: string; name: string }>
) => {
  const sampleFallback = [
    {
      "Employee ID": "EMP1001",
      "Employee Name": "Sample Employee",
      "Basic Pay": 50000,
      "HRA": 20000,
      "LTA": 5000,
      "Other Allowance": 5000,
      "Bonus": 0,
      "Health Insurance": 1500,
      "Effective From": dayjs().format("YYYY-MM-DD"),
      "Effective To": "",
      "Payment Frequency": "Monthly",
    },
  ];

  const rows = employees.length > 0
    ? employees.map((emp) => {
        const row: Record<string, string | number> = {
          "Employee ID": emp.employeeId,
          "Employee Name": emp.employeeName,
          "Basic Pay": emp.activeSalary?.basicPay ?? 0,
          "HRA": emp.activeSalary?.hra ?? 0,
          "LTA": emp.activeSalary?.lta ?? 0,
          "Other Allowance": emp.activeSalary?.otherAllowance ?? 0,
          "Bonus": emp.activeSalary?.bonus ?? 0,
          "Health Insurance": emp.activeSalary?.healthInsurance ?? 0,
        };
        for (const comp of customComponents ?? []) {
          if (comp.name) row[comp.name] = 0;
        }
        row["Effective From"] = emp.activeSalary?.effectiveFrom
          ? dayjs(emp.activeSalary.effectiveFrom as string | Date).format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD");
        row["Effective To"] = emp.activeSalary?.effectiveTo
          ? dayjs(emp.activeSalary.effectiveTo as string | Date).format("YYYY-MM-DD")
          : "";
        row["Payment Frequency"] = "Monthly";
        return row;
      })
    : sampleFallback;

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = Object.keys(rows[0]!).map((header) => ({
    wch: Math.max(header.length + 4, 14),
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll Salaries");
  XLSX.writeFile(workbook, `payroll-salary-template-${dayjs().format("YYYY-MM-DD")}.xlsx`);
};
