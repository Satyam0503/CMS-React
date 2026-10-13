import { describe, expect, it } from 'vitest';
import { calculateTemplate, type SalaryTemplate } from './payrollTemplateCalculation';
const template: SalaryTemplate = { name: 'Engineer', basicPay: 30000, hra: 12000, effectiveFrom: '2026-10-01', isActive: true };
describe('Salary template totals', () => {
  it('supports a historical custom bonus when the legacy bonus amount is absent', () => {
    expect(calculateTemplate({ ...template, components: [
      { code: 'BONUS', name: 'Bonus', kind: 'EARNING', calculationType: 'FIXED', value: 1000, isTaxable: true, sortOrder: 1 },
    ] })).toMatchObject({ success: true, gross: 43000 });
  });
  it('includes custom fixed earnings and keeps deductions separate', () => {
    expect(calculateTemplate({ ...template, components: [
      { code: 'MEAL', name: 'Meal', kind: 'EARNING', calculationType: 'FIXED', value: 2000, isTaxable: true, sortOrder: 1 },
      { code: 'RECOVERY', name: 'Recovery', kind: 'DEDUCTION', calculationType: 'FIXED', value: 500, isTaxable: false, sortOrder: 2 },
    ] })).toMatchObject({ success: true, gross: 44000, deductions: 500, net: 43500 });
  });
  it('resolves a percentage of basic pay', () => {
    expect(calculateTemplate({ ...template, components: [
      { code: 'TRAVEL', name: 'Travel', kind: 'EARNING', calculationType: 'PERCENT_OF_COMPONENT', baseComponentCode: 'BASIC', value: 10, isTaxable: true, sortOrder: 1 },
    ] })).toMatchObject({ success: true, gross: 45000, net: 45000 });
  });
  it('rejects duplicate standard codes', () => {
    expect(calculateTemplate({ ...template, components: [
      { code: 'BASIC', name: 'Basic', kind: 'EARNING', calculationType: 'FIXED', value: 1, isTaxable: true, sortOrder: 1 },
    ] }).success).toBe(false);
  });
  it('rejects negative, nonfinite and excessive deductions', () => {
    expect(calculateTemplate({ ...template, basicPay: -1 }).success).toBe(false);
    expect(calculateTemplate({ ...template, basicPay: Number.NaN }).success).toBe(false);
    expect(calculateTemplate({ ...template, components: [
      { code: 'RECOVERY', name: 'Recovery', kind: 'DEDUCTION', calculationType: 'FIXED', value: 50000, isTaxable: false, sortOrder: 1 },
    ] }).success).toBe(false);
  });
});
