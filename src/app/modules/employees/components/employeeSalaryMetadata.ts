import type { EmployeeSalaryComponentValueModel, EmployeeSalaryStructureModel, PayrollPayGroupModel, PayrollSalaryComponentModel, PayrollSalaryTemplateComponentModel, PayrollSalaryTemplateModel } from "../../payroll/models";

type PayrollComponentInput = Pick<EmployeeSalaryComponentValueModel,
  "componentCode" | "kind" | "value" | "calculationType" | "baseComponentCode" | "isRecurring" | "isStatutory" | "isEmployerContribution">;
const codeOf = (code: string) => code.trim().toUpperCase();
const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export const salaryTemplateValues = (template: PayrollSalaryTemplateModel) => {
  const values: Record<string, number> = {
    BASIC: template.basicPay ?? 0, HRA: template.hra ?? 0, LTA: template.lta ?? 0,
    OTHER_ALLOWANCE: template.otherAllowance ?? 0, BONUS: template.bonus ?? 0,
    HEALTH_INSURANCE: 0,
  };
  // Support both dedicated legacy amounts and canonical component-based templates.
  for (const component of template.components ?? []) {
    const code = codeOf(component.code);
    if (code === "TOTAL_DEDUCTIONS") continue;
    values[code === "BASIC_PAY" ? "BASIC" : code] = component.value;
  }
  return values;
};

export const getSalaryComponentInputGuidance = (component: { calculationType: string; baseComponentCode?: string | null }) => {
  if (component.calculationType === "PERCENT_OF_COMPONENT") return {
    valueUnit: "%",
    helperText: "Enter a rate. Payroll calculates this as a percentage of " + (component.baseComponentCode || "the configured base component") + ".",
  };
  if (component.calculationType === "PERCENT_OF_GROSS") return {
    valueUnit: "%",
    helperText: "Enter a rate. Payroll calculates this from eligible recurring earnings, excluding other percentage-of-gross components.",
  };
  return { valueUnit: undefined, helperText: undefined };
};

// Mirrors PayrollComponentCalculationEngine so a draft's gross uses payroll's
// formula dependencies, rounding, and recurring-earning rules.
export const calculateEmployeePayrollComponents = (components: PayrollComponentInput[]) => {
  const byCode = new Map<string, PayrollComponentInput>();
  for (const component of components) {
    const code = codeOf(component.componentCode);
    if (!code) return { success: false as const, errorMessage: "Every payroll component must have a code." };
    if (byCode.has(code)) return { success: false as const, errorMessage: "Payroll component code '" + code + "' is duplicated." };
    if (!["EARNING", "DEDUCTION"].includes(component.kind.toUpperCase())) return { success: false as const, errorMessage: "Payroll component '" + code + "' has an unsupported kind." };
    if (!["FIXED", "PERCENT_OF_GROSS", "PERCENT_OF_COMPONENT"].includes(component.calculationType.toUpperCase())) return { success: false as const, errorMessage: "Payroll component '" + code + "' has an unsupported calculation type." };
    if (!Number.isFinite(component.value) || component.value < 0) return { success: false as const, errorMessage: "Payroll component '" + code + "' must have a non-negative numeric value." };
    byCode.set(code, component);
  }
  const values = new Map<string, number>();
  const visiting = new Set<string>();
  const evaluate = (rawCode: string): number => {
    const code = codeOf(rawCode);
    const cached = values.get(code);
    if (cached !== undefined) return cached;
    const component = byCode.get(code);
    if (!component) throw new Error("Payroll component base '" + code + "' is missing.");
    if (visiting.has(code)) throw new Error("Payroll component formula cycle detected at '" + code + "'.");
    visiting.add(code);
    const type = component.calculationType.toUpperCase();
    let amount = component.value;
    if (type === "PERCENT_OF_COMPONENT") {
      if (!component.baseComponentCode?.trim()) throw new Error("Payroll component '" + code + "' requires a base component.");
      amount = evaluate(component.baseComponentCode) * component.value / 100;
    } else if (type === "PERCENT_OF_GROSS") {
      let baseGross = 0;
      for (const base of byCode.values()) {
        if (base.kind.toUpperCase() !== "EARNING" || !base.isRecurring || base.isStatutory || base.isEmployerContribution || base.calculationType.toUpperCase() === "PERCENT_OF_GROSS") continue;
        baseGross += evaluate(base.componentCode);
      }
      amount = baseGross * component.value / 100;
    }
    visiting.delete(code);
    const rounded = roundMoney(Math.max(0, amount));
    values.set(code, rounded);
    return rounded;
  };
  try {
    for (const component of byCode.values()) evaluate(component.componentCode);
  } catch (error) {
    return { success: false as const, errorMessage: error instanceof Error ? error.message : "Payroll component formula is invalid." };
  }
  const sum = (include: (component: PayrollComponentInput) => boolean) => roundMoney(
    [...byCode.values()].filter(include).reduce((total, component) => total + (values.get(codeOf(component.componentCode)) ?? 0), 0),
  );
  const gross = Math.max(0, sum((component) => component.kind.toUpperCase() === "EARNING" && component.isRecurring && !component.isStatutory && !component.isEmployerContribution));
  const deductions = Math.max(0, sum((component) => component.kind.toUpperCase() === "DEDUCTION" && component.isRecurring && !component.isStatutory && !component.isEmployerContribution));
  if (deductions > gross) return { success: false as const, errorCode: "PAYROLL_NET_NEGATIVE", errorMessage: "Recurring employee deductions exceed recurring gross salary. Review the salary structure before payroll can proceed." };
  return { success: true as const, values: Object.fromEntries(values), gross, deductions, net: roundMoney(gross - deductions) };
};

// Offer documents provide currency amounts while configured formula components
// store rates. Convert using the configured denominator before preview or save.
export const normalizeImportedSalaryComponentValues = (
  importedComponents: EmployeeSalaryComponentValueModel[],
  definitions: PayrollSalaryComponentModel[],
  effectiveFrom: string | Date,
) => {
  const components = importedComponents.map((component) => {
    const definition = resolveEmployeePayrollComponentDefinition(definitions, component.componentCode, effectiveFrom);
    return definition ? {
      ...component, componentName: definition.name, kind: definition.kind,
      calculationType: definition.calculationType, baseComponentCode: definition.baseComponentCode,
      isTaxable: definition.isTaxable,
    } : component;
  });
  const importedAmounts = new Map(components.map((component) => [codeOf(component.componentCode), component.value]));
  const amountFor = (code: string) => {
    const normalized = codeOf(code);
    if (importedAmounts.has(normalized)) return importedAmounts.get(normalized)!;
    if (normalized === "BASIC_PAY") return importedAmounts.get("BASIC");
    if (normalized === "BASIC") return importedAmounts.get("BASIC_PAY");
    return undefined;
  };
  return components.map((component) => {
    const type = component.calculationType.toUpperCase();
    if (type === "FIXED") return component;
    let denominator: number;
    if (type === "PERCENT_OF_COMPONENT") {
      if (!component.baseComponentCode?.trim()) throw new Error("Payroll component '" + component.componentCode + "' requires a base component.");
      denominator = amountFor(component.baseComponentCode) ?? 0;
    } else if (type === "PERCENT_OF_GROSS") {
      denominator = components.filter((base) =>
        base.kind.toUpperCase() === "EARNING" && base.isRecurring && !base.isStatutory && !base.isEmployerContribution && base.calculationType.toUpperCase() !== "PERCENT_OF_GROSS",
      ).reduce((total, base) => total + base.value, 0);
    } else {
      throw new Error("Payroll component '" + component.componentCode + "' has an unsupported calculation type.");
    }
    if (denominator <= 0) {
      if (component.value === 0) return { ...component, value: 0, percentage: 0 };
      throw new Error("Cannot convert the imported amount for " + component.componentName + " to a percentage because its configured base is zero or missing. Include the base amount in the offer or enter the rate manually.");
    }
    const rate = component.value / denominator * 100;
    return { ...component, value: rate, percentage: rate };
  });
};

const dateOnly = (value: string | Date) => String(value).slice(0, 10);

export const resolveSalaryImportEffectiveDate = (
  importedEffectiveFrom: string | undefined,
  formEffectiveFrom: string | undefined,
  fallbackDate: string,
) => dateOnly(importedEffectiveFrom || formEffectiveFrom || fallbackDate);

const standardPayrollCodes = new Set([
  "BASIC",
  "BASIC_PAY",
  "HRA",
  "LTA",
  "OTHER_ALLOWANCE",
  "BONUS",
  "HEALTH_INSURANCE",
]);

export const isEmployeePayrollComponentEligible = (
  definitions: PayrollSalaryComponentModel[],
  code: string,
  effectiveFrom: string | Date,
  allowUnconfiguredLegacyDefault = false,
) => {
  const normalized = code.trim().toUpperCase();
  const date = dateOnly(effectiveFrom);
  const matchingDefinition = definitions
    .filter((definition) => definition.code.trim().toUpperCase() === normalized && dateOnly(definition.effectiveFrom) <= date)
    .sort((left, right) => dateOnly(right.effectiveFrom).localeCompare(dateOnly(left.effectiveFrom)) || right.version - left.version)[0];

  if (matchingDefinition) {
    return Boolean(matchingDefinition.isActive && (!matchingDefinition.effectiveTo || dateOnly(matchingDefinition.effectiveTo) >= date));
  }

  if (normalized === "BASIC" || normalized === "BASIC_PAY") {
    return true;
  }

  if (definitions.length === 0) {
    return standardPayrollCodes.has(normalized) || allowUnconfiguredLegacyDefault;
  }

  return false;
};

export const resolveEmployeePayrollComponentDefinition = (
  definitions: PayrollSalaryComponentModel[],
  code: string,
  effectiveFrom: string | Date,
) => {
  const normalizedCode = code.trim().toUpperCase();
  const date = dateOnly(effectiveFrom);
  const latest = definitions
    .filter((definition) => definition.code.trim().toUpperCase() === normalizedCode && dateOnly(definition.effectiveFrom) <= date)
    .sort((left, right) => dateOnly(right.effectiveFrom).localeCompare(dateOnly(left.effectiveFrom)) || right.version - left.version)[0];
  return latest?.isActive && (!latest.effectiveTo || dateOnly(latest.effectiveTo) >= date) ? latest : undefined;
};

export const resolveEmployeePayrollComponents = (
  definitions: PayrollSalaryComponentModel[],
  templateComponents: PayrollSalaryTemplateComponentModel[],
  effectiveFrom: string | Date,
  importedComponents: EmployeeSalaryComponentValueModel[] = [],
) => {
  // Older tenants may have templates but no component catalog. Keep those
  // templates usable; once a catalog exists, it is authoritative for eligibility.
  const source = definitions.length === 0
    ? templateComponents
    : [...new Set(definitions.map((definition) => definition.code.trim().toUpperCase()))]
      .map((code) => resolveEmployeePayrollComponentDefinition(definitions, code, effectiveFrom))
      .filter((definition): definition is PayrollSalaryComponentModel => definition !== undefined)
      .map((definition) => {
        const templateComponent = templateComponents.find((component) => component.code.trim().toUpperCase() === definition.code.trim().toUpperCase());
        return {
          componentId: definition.id,
          code: definition.code,
          name: definition.name,
          kind: definition.kind,
          calculationType: definition.calculationType,
          baseComponentCode: definition.baseComponentCode,
          value: templateComponent?.value ?? 0,
          isTaxable: definition.isTaxable,
          sortOrder: templateComponent?.sortOrder ?? 0,
        } satisfies PayrollSalaryTemplateComponentModel;
      });

  return excludeImportedTemplateComponents(source, importedComponents);
};

export const excludeImportedTemplateComponents = (
  templateComponents: PayrollSalaryTemplateComponentModel[],
  importedComponents: EmployeeSalaryComponentValueModel[],
) => {
  const importedCodes = new Set(importedComponents.map((component) => component.componentCode.trim().toUpperCase()));
  return templateComponents.filter((component) => !importedCodes.has(component.code.trim().toUpperCase()));
};

export const resolveEmployeeSalaryMetadata = (
  selectedTemplateId: string,
  selectedPayGroupId: string,
  templates: PayrollSalaryTemplateModel[],
  payGroups: PayrollPayGroupModel[] = [],
  importedMetadata: Partial<Pick<EmployeeSalaryStructureModel, "offerId" | "offerVersion" | "employeeType" | "gradeId" | "departmentId">> = {},
) => {
  const template = templates.find((item) => item.id === selectedTemplateId);
  const requestedPayGroupId = selectedPayGroupId || template?.payGroupId || undefined;
  const payGroupId = requestedPayGroupId && payGroups.some((group) => group.id === requestedPayGroupId && group.isActive)
    ? requestedPayGroupId
    : undefined;
  return {
    salaryTemplateId: template?.id,
    payGroupId,
    offerId: importedMetadata.offerId || undefined,
    offerVersion: importedMetadata.offerVersion ?? undefined,
    employeeType: importedMetadata.employeeType || template?.employeeType || undefined,
    gradeId: importedMetadata.gradeId || template?.gradeId || undefined,
    departmentId: importedMetadata.departmentId || template?.departmentId || undefined,
  };
};
