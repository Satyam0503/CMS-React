import { describe, expect, it } from "vitest";
import type { EmployeeSalaryComponentValueModel, PayrollSalaryComponentModel } from "../../payroll/models";
import { calculateEmployeePayrollComponents, excludeImportedTemplateComponents, getSalaryComponentInputGuidance, isEmployeePayrollComponentEligible, normalizeImportedSalaryComponentValues, resolveEmployeePayrollComponentDefinition, resolveEmployeePayrollComponents, resolveEmployeeSalaryMetadata, resolveSalaryImportEffectiveDate } from "./employeeSalaryMetadata";

describe("monthly salary recurrence", () => {
  it("keeps one-time items out of recurring preview totals", () => {
    const result = calculateEmployeePayrollComponents([
      { componentCode: "BASIC", kind: "EARNING", calculationType: "FIXED", value: 30000, isRecurring: true, isStatutory: false, isEmployerContribution: false },
      { componentCode: "BONUS", kind: "EARNING", calculationType: "FIXED", value: 3000, isRecurring: false, isStatutory: false, isEmployerContribution: false },
      { componentCode: "RECOVERY", kind: "DEDUCTION", calculationType: "FIXED", value: 1500, isRecurring: false, isStatutory: false, isEmployerContribution: false },
      { componentCode: "LOAN", kind: "DEDUCTION", calculationType: "FIXED", value: 500, isRecurring: true, isStatutory: false, isEmployerContribution: false },
    ]);
    expect(result).toMatchObject({ success: true, gross: 30000, deductions: 500, net: 29500 });
  });

  it("rejects recurring deductions greater than recurring gross", () => {
    const result = calculateEmployeePayrollComponents([
      { componentCode: "BASIC", kind: "EARNING", calculationType: "FIXED", value: 1000, isRecurring: true, isStatutory: false, isEmployerContribution: false },
      { componentCode: "LOAN", kind: "DEDUCTION", calculationType: "FIXED", value: 1200, isRecurring: true, isStatutory: false, isEmployerContribution: false },
    ]);
    expect(result).toMatchObject({ success: false, errorCode: "PAYROLL_NET_NEGATIVE" });
  });
});

describe("resolveSalaryImportEffectiveDate", () => {
  it("prefers the date in the imported offer", () => {
    expect(resolveSalaryImportEffectiveDate("2026-12-01", "2026-11-01", "2026-10-06")).toBe("2026-12-01");
  });

  it("uses the form start date when the imported offer has no effective date", () => {
    expect(resolveSalaryImportEffectiveDate(undefined, "2026-11-01", "2026-10-06")).toBe("2026-11-01");
  });

  it("uses the supplied current-date fallback only when neither source has a date", () => {
    expect(resolveSalaryImportEffectiveDate(undefined, undefined, "2026-10-06")).toBe("2026-10-06");
  });
});

describe("resolveEmployeeSalaryMetadata", () => {
  const templates = [{
    id: "template-senior",
    name: "Senior monthly",
    payGroupId: "group-monthly",
    employeeType: "PERMANENT",
    gradeId: "G5",
    departmentId: "engineering",
    components: [],
    effectiveFrom: "2026-01-01",
    isActive: true,
    version: 1,
  }];
  const groups = [
    { id: "group-monthly", name: "Monthly", schedule: "MONTHLY", effectiveFrom: "2026-01-01", isActive: true, version: 1 },
    { id: "group-contract", name: "Contract", schedule: "MONTHLY", effectiveFrom: "2026-01-01", isActive: true, version: 1 },
    { id: "group-closed", name: "Closed", schedule: "MONTHLY", effectiveFrom: "2026-01-01", isActive: false, version: 1 },
  ];

  it("persists the selected template and inherits its pay-group and HR classification defaults", () => {
    expect(resolveEmployeeSalaryMetadata("template-senior", "", templates, groups)).toEqual({
      salaryTemplateId: "template-senior",
      payGroupId: "group-monthly",
      offerId: undefined,
      offerVersion: undefined,
      employeeType: "PERMANENT",
      gradeId: "G5",
      departmentId: "engineering",
    });
  });

  it("lets HR override the template pay group for an employee", () => {
    expect(resolveEmployeeSalaryMetadata("template-senior", "group-contract", templates, groups).payGroupId).toBe("group-contract");
  });

  it("keeps a manual salary structure unlinked when no template or group was selected", () => {
    expect(resolveEmployeeSalaryMetadata("", "", templates, groups)).toEqual({
      salaryTemplateId: undefined,
      payGroupId: undefined,
      offerId: undefined,
      offerVersion: undefined,
      employeeType: undefined,
      gradeId: undefined,
      departmentId: undefined,
    });
  });

  it("preserves imported offer classifications and only accepts an active company pay group", () => {
    expect(resolveEmployeeSalaryMetadata("", "group-closed", templates, groups, {
      offerId: "offer-9",
      offerVersion: 3,
      employeeType: "CONTRACTOR",
      gradeId: "C2",
      departmentId: "operations",
    })).toEqual({
      salaryTemplateId: undefined,
      payGroupId: undefined,
      offerId: "offer-9",
      offerVersion: 3,
      employeeType: "CONTRACTOR",
      gradeId: "C2",
      departmentId: "operations",
    });
  });
});

describe("excludeImportedTemplateComponents", () => {
  const templateComponents = [
    { code: "SHIFT_ALLOWANCE", name: "Shift allowance", kind: "EARNING" as const, calculationType: "FIXED", value: 5000, isTaxable: true, sortOrder: 1 },
    { code: "MEAL_ALLOWANCE", name: "Meal allowance", kind: "EARNING" as const, calculationType: "FIXED", value: 1000, isTaxable: true, sortOrder: 2 },
  ];

  it("lets an imported offer amount override its matching template component without dropping other defaults", () => {
    expect(excludeImportedTemplateComponents(templateComponents, [
      { componentCode: " shift_allowance ", componentName: "Shift allowance", kind: "EARNING", value: 7000, calculationType: "FIXED", isTaxable: true, isRecurring: true, isStatutory: false, isEmployerContribution: false },
    ])).toEqual([templateComponents[1]]);
  });

  it("keeps every template component when import has no custom component values", () => {
    expect(excludeImportedTemplateComponents(templateComponents, [])).toEqual(templateComponents);
  });
});

describe("resolveEmployeePayrollComponents", () => {
  const definitions = [
    { id: "bonus-v1", code: "BONUS", name: "Bonus", kind: "EARNING" as const, calculationType: "FIXED" as const, isTaxable: true, isActive: true, effectiveFrom: "2026-01-01", version: 1 },
    { id: "meal-v1", code: "MEAL", name: "Meal allowance", kind: "EARNING" as const, calculationType: "FIXED" as const, isTaxable: true, isActive: false, effectiveFrom: "2026-01-01", version: 1 },
    { id: "travel-v1", code: "TRAVEL", name: "Travel", kind: "EARNING" as const, calculationType: "FIXED" as const, isTaxable: true, isActive: true, effectiveFrom: "2027-01-01", version: 1 },
  ];

  it("shows only active components effective on the salary start date", () => {
    expect(resolveEmployeePayrollComponents(definitions, [], "2026-07-01").map(({ code }) => code)).toEqual(["BONUS"]);
  });

  it("lets an imported offer component take precedence over a template value", () => {
    const result = resolveEmployeePayrollComponents(definitions, [
      { code: "BONUS", name: "Bonus", kind: "EARNING", calculationType: "FIXED", value: 500, isTaxable: true, sortOrder: 1 },
    ], "2026-07-01", [
      { componentCode: "BONUS", componentName: "Bonus", kind: "EARNING", value: 900, calculationType: "FIXED", isTaxable: true, isRecurring: true, isStatutory: false, isEmployerContribution: false },
    ]);
    expect(result).toEqual([]);
  });

  it("keeps legacy template components available when the tenant has no component catalog", () => {
    const legacy = [{ code: "SHIFT", name: "Shift allowance", kind: "EARNING" as const, calculationType: "FIXED", value: 300, isTaxable: true, sortOrder: 1 }];
    expect(resolveEmployeePayrollComponents([], legacy, "2026-07-01")).toEqual(legacy);
  });

  it("does not enable a component outside its effective dates or when the tenant has disabled it", () => {
    expect(isEmployeePayrollComponentEligible(definitions, "MEAL", "2026-07-01")).toBe(false);
    expect(isEmployeePayrollComponentEligible(definitions, "TRAVEL", "2026-07-01")).toBe(false);
    expect(isEmployeePayrollComponentEligible(definitions, "BONUS", "2026-07-01")).toBe(true);
  });

  it("uses the latest effective component revision, including an inactive revision", () => {
    const revisions = [
      { ...definitions[0], effectiveFrom: "2026-01-01", version: 1, isActive: true },
      { ...definitions[0], effectiveFrom: "2026-10-01", version: 2, isActive: false },
    ];
    expect(isEmployeePayrollComponentEligible(revisions, "BONUS", "2026-09-30")).toBe(true);
    expect(isEmployeePayrollComponentEligible(revisions, "BONUS", "2026-10-01")).toBe(false);
    expect(resolveEmployeePayrollComponents(revisions, [], "2026-10-01")).toEqual([]);
  });
});

describe("employee salary formula values", () => {
  const component = (overrides: Partial<EmployeeSalaryComponentValueModel> & Pick<EmployeeSalaryComponentValueModel, "componentCode" | "kind" | "value" | "calculationType">): EmployeeSalaryComponentValueModel => ({
    componentName: overrides.componentCode,
    baseComponentCode: undefined,
    isTaxable: overrides.kind === "EARNING",
    isRecurring: true,
    isStatutory: false,
    isEmployerContribution: false,
    ...overrides,
  });

  it("explains percentage-of-component and percentage-of-gross entry units", () => {
    expect(getSalaryComponentInputGuidance({ calculationType: "PERCENT_OF_COMPONENT", baseComponentCode: "BASIC" })).toEqual({
      valueUnit: "%",
      helperText: "Enter a rate. Payroll calculates this as a percentage of BASIC.",
    });
    expect(getSalaryComponentInputGuidance({ calculationType: "PERCENT_OF_GROSS" }).valueUnit).toBe("%");
    expect(getSalaryComponentInputGuidance({ calculationType: "FIXED" }).valueUnit).toBeUndefined();
  });

  it("calculates formula earnings and deductions with payroll's denominator and rounding rules", () => {
    const result = calculateEmployeePayrollComponents([
      component({ componentCode: "BASIC", kind: "EARNING", value: 10000, calculationType: "FIXED" }),
      component({ componentCode: "HRA", kind: "EARNING", value: 40, calculationType: "PERCENT_OF_COMPONENT", baseComponentCode: "BASIC" }),
      component({ componentCode: "ALLOWANCE", kind: "EARNING", value: 10, calculationType: "PERCENT_OF_GROSS" }),
      component({ componentCode: "PF", kind: "DEDUCTION", value: 12, calculationType: "PERCENT_OF_COMPONENT", baseComponentCode: "BASIC" }),
    ]);

    expect(result).toMatchObject({ success: true, gross: 15400, deductions: 1200, net: 14200 });
    if (result.success) expect(result.values).toEqual({ BASIC: 10000, HRA: 4000, ALLOWANCE: 1400, PF: 1200 });
  });

  it("converts offer-document amounts into the company-configured percentage rates", () => {
    const components: EmployeeSalaryComponentValueModel[] = [
      component({ componentCode: "BASIC", kind: "EARNING", value: 10000, calculationType: "FIXED" }),
      component({ componentCode: "HRA", kind: "EARNING", value: 4000, calculationType: "FIXED" }),
      component({ componentCode: "ALLOWANCE", kind: "EARNING", value: 1400, calculationType: "FIXED" }),
    ];
    const definitions: PayrollSalaryComponentModel[] = [
      { id: "hra", code: "HRA", name: "Housing allowance", kind: "EARNING", calculationType: "PERCENT_OF_COMPONENT", baseComponentCode: "BASIC", isTaxable: true, isActive: true, effectiveFrom: "2026-01-01", version: 1 },
      { id: "allowance", code: "ALLOWANCE", name: "Allowance", kind: "EARNING", calculationType: "PERCENT_OF_GROSS", isTaxable: true, isActive: true, effectiveFrom: "2026-01-01", version: 1 },
    ];

    const normalized = normalizeImportedSalaryComponentValues(components, definitions, "2026-10-06");
    expect(normalized.map(({ componentCode, value, calculationType }) => ({ componentCode, value, calculationType }))).toEqual([
      { componentCode: "BASIC", value: 10000, calculationType: "FIXED" },
      { componentCode: "HRA", value: 40, calculationType: "PERCENT_OF_COMPONENT" },
      { componentCode: "ALLOWANCE", value: 10, calculationType: "PERCENT_OF_GROSS" },
    ]);
    expect(normalized[1].percentage).toBe(40);
    expect(normalized[2].percentage).toBe(10);
    expect(calculateEmployeePayrollComponents(normalized)).toMatchObject({ success: true, gross: 15400 });
  });

  it("refuses a nonzero imported amount if its percentage base is missing or zero", () => {
    const components = [component({ componentCode: "HRA", kind: "EARNING", value: 4000, calculationType: "FIXED" })];
    const definitions: PayrollSalaryComponentModel[] = [
      { id: "hra", code: "HRA", name: "Housing allowance", kind: "EARNING", calculationType: "PERCENT_OF_COMPONENT", baseComponentCode: "BASIC", isTaxable: true, isActive: true, effectiveFrom: "2026-01-01", version: 1 },
    ];
    expect(() => normalizeImportedSalaryComponentValues(components, definitions, "2026-10-06")).toThrow("base is zero or missing");
  });

  it("aliases SPECIAL_ALLOWANCE and OTHER_ALLOWANCE so either satisfies eligibility and definition resolution", () => {
    const definitions: PayrollSalaryComponentModel[] = [
      { id: "sa-1", code: "SPECIAL_ALLOWANCE", name: "Special Allowance", kind: "EARNING", calculationType: "FIXED", isTaxable: true, isActive: true, effectiveFrom: "2026-01-01", version: 1 },
    ];

    expect(isEmployeePayrollComponentEligible(definitions, "SPECIAL_ALLOWANCE", "2026-10-14")).toBe(true);
    expect(isEmployeePayrollComponentEligible(definitions, "OTHER_ALLOWANCE", "2026-10-14")).toBe(true);

    const resolvedForOther = resolveEmployeePayrollComponentDefinition(definitions, "OTHER_ALLOWANCE", "2026-10-14");
    expect(resolvedForOther?.code).toBe("SPECIAL_ALLOWANCE");
    expect(resolvedForOther?.name).toBe("Special Allowance");

    const resolvedForSpecial = resolveEmployeePayrollComponentDefinition(definitions, "SPECIAL_ALLOWANCE", "2026-10-14");
    expect(resolvedForSpecial?.code).toBe("SPECIAL_ALLOWANCE");
  });
});

