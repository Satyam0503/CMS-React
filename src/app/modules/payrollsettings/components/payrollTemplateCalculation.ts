import { calculateEmployeePayrollComponents } from '../../employees/components/employeeSalaryMetadata';

export type TemplateComponent = {
  componentId?: string; code: string; name: string; kind: 'EARNING' | 'DEDUCTION';
  calculationType: 'FIXED' | 'PERCENT_OF_GROSS' | 'PERCENT_OF_COMPONENT';
  baseComponentCode?: string; value: number; isTaxable: boolean; sortOrder: number;
};
export type SalaryTemplate = {
  id?: string; name: string; payGroupId?: string; version?: number;
  sourceTemplateId?: string; sourceTemplateVersion?: number;
  isRetired?: boolean;
  basicPay?: number; hra?: number; lta?: number; otherAllowance?: number; bonus?: number;
  components?: TemplateComponent[]; effectiveFrom: string; effectiveTo?: string | null; isActive: boolean;
};
export function calculateTemplate(template: SalaryTemplate) {
  const standard = [
    ['BASIC', template.basicPay], ['HRA', template.hra], ['LTA', template.lta],
    ['OTHER_ALLOWANCE', template.otherAllowance], ['BONUS', template.bonus],
  ] as const;
  return calculateEmployeePayrollComponents([
    ...standard.filter(([code, value]) => value != null || !(template.components ?? []).some(component => component.code.trim().toUpperCase() === code))
      .map(([componentCode, value]) => ({ componentCode, value: value ?? 0, kind: 'EARNING' as const,
      calculationType: 'FIXED' as const, isRecurring: true, isStatutory: false, isEmployerContribution: false })),
    ...(template.components ?? []).map(component => ({ ...component, componentCode: component.code,
      isRecurring: true, isStatutory: false, isEmployerContribution: false })),
  ]);
}
