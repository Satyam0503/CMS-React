import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { FormikProps } from "formik";
import dayjs from "dayjs";
import type { CreateEmployeeSalary, SalaryModel } from "../models";
import { UpdateEmployeeSalaryData } from "./UpdateEmployeeSalaryData";
import * as payrollServices from "../../payroll/services";

const payrollComponents = vi.hoisted(() => ({ rows: [] as unknown[] }));

vi.mock("react-intl", () => ({ useIntl: () => ({ formatMessage: ({ id }: { id: string }) => id }) }));
vi.mock("@mui/icons-material", () => ({
  CloudUploadRounded: () => null,
  FileDownloadOutlined: () => null,
  PaymentsOutlined: () => null,
  AccountBalanceWalletOutlined: () => null,
  CalendarMonthOutlined: () => null,
  InfoOutlined: () => null,
}));
vi.mock("@mui/system", () => ({
  Grid: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Stack: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@mui/material", () => {
  const Wrapper = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  return {
    Alert: Wrapper,
    Box: Wrapper,
    Card: Wrapper,
    Chip: ({ label, children }: { label?: React.ReactNode; children?: React.ReactNode }) => <span>{label ?? children}</span>,
    Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { startIcon?: React.ReactNode }) => <button {...props}>{children}</button>,
    FormControl: Wrapper,
    InputLabel: ({ children }: { children?: React.ReactNode }) => <label>{children}</label>,
    MenuItem: ({ children, value }: { children?: React.ReactNode; value?: string }) => <option value={value}>{children}</option>,
    Typography: Wrapper,
    alpha: () => "",
  };
});
vi.mock("../../../shared/components/ui", () => ({
  AppSelect: ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...props}>{children}</select>,
}));
vi.mock("../../../shared/components/form-component/CurrencyInput", async () => {
  const { useFormikContext } = await import("formik");
  return { CurrencyInput: ({ label, name, valueUnit, helperText }: { label: string; name: string; valueUnit?: string; helperText?: string }) => {
    const formik = useFormikContext<Record<string, unknown>>();
    return <label>{label}{valueUnit && <span data-value-unit={valueUnit}>{valueUnit}</span>}{helperText && <small>{helperText}</small>}<input name={name} value={String(formik.values[name] ?? "")} onChange={formik.handleChange} /></label>;
  } };
});
vi.mock("../../../shared/components/C_DatePicker", () => ({
  default: ({ label, name, value, setValue }: { label: string; name: string; value: { format: (format: string) => string } | null; setValue: (value: unknown) => void }) =>
    <label>{label}<input type="date" name={name} value={value?.format("YYYY-MM-DD") ?? ""} onChange={(event) => setValue(event.target.value ? event.target.value : null)} /></label>,
}));
vi.mock("../../payroll/services", () => ({
  getEmployeeSalaryHistory: vi.fn(async () => ({ data: [] })),
  getPayrollPayGroups: vi.fn(async () => ({ data: [] })),
  getPayrollSalaryTemplates: vi.fn(async () => ({ data: [] })),
  getPayrollSalaryComponents: vi.fn(async () => ({ data: payrollComponents.rows })),
  previewEmployeeSalaryImport: vi.fn(),
  previewEmployeeSalaryPdf: vi.fn(),
  saveEmployeeSalaryStructure: vi.fn(async () => ({ data: { success: true } })),
}));
vi.mock("react-toastify", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
describe("employee salary component configuration", () => {
  let root: Root | undefined;
  let container: HTMLDivElement;

  afterEach(async () => {
    await act(async () => root?.unmount());
    root = undefined;
    container?.remove();
  });

  async function renderSalaryForm(rows: unknown[], formRef: { current: FormikProps<CreateEmployeeSalary> | null } = { current: null }, defaultEffectiveFrom?: string, existingSalary?: SalaryModel | null) {
    payrollComponents.rows = rows;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => root?.render(<UpdateEmployeeSalaryData
      userId="user-1"
      employeeId="employee-1"
      defaultEffectiveFrom={defaultEffectiveFrom}
      onUserUpdate={() => undefined}
      formRef={formRef}
      handleButtonLoading={() => undefined}
      existingSalary={existingSalary}
    />));
    await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
  }

  it("uses the employee start date as the initial salary effective-from date", async () => {
    await renderSalaryForm([], { current: null }, "2026-11-01");

    expect(container.querySelector<HTMLInputElement>('input[name="effectiveFrom"]')?.value).toBe("2026-11-01");
    expect(container.textContent).toContain("This group supplies the employee's payroll schedule");
    expect(container.textContent).not.toContain(String.fromCharCode(0x19));
    expect(container.textContent).toContain("When does this salary apply?");
    expect(container.textContent).toContain("Optional end date. Leave blank for the current version.");
    expect(container.textContent).toContain("the prior one normally ends the day before");
  });

  it("explains the supported monthly payroll cadence instead of offering unused frequency choices", async () => {
    await renderSalaryForm([]);

    expect(container.textContent).toContain("Payroll cadence: monthly.");
    expect(container.textContent).toContain("weekly, biweekly, quarterly, and annual payroll runs are not currently supported");
    expect(container.querySelector('[name="paymentFrequency"]')).toBeNull();
  });

  it("blocks saving a salary revision whose end date precedes its start date", async () => {
    const formRef: { current: FormikProps<CreateEmployeeSalary> | null } = { current: null };
    vi.mocked(payrollServices.saveEmployeeSalaryStructure).mockClear();
    await renderSalaryForm([], formRef, "2026-12-01");
    await act(async () => {
      await formRef.current?.setValues((current) => ({ ...current, effectiveTo: dayjs("2026-11-30") }));
    });
    await act(async () => { await formRef.current?.submitForm(); });

    expect(container.textContent).toContain("End date must be on or after the start date.");
    expect(payrollServices.saveEmployeeSalaryStructure).not.toHaveBeenCalled();
  });

  it("edits a legacy salary without a linked account id using the employee context id", async () => {
    const formRef: { current: FormikProps<CreateEmployeeSalary> | null } = { current: null };
    const legacySalary = {
      userId: null,
      employeeId: "employee-1",
      basicPay: 50000,
      hra: 0,
      lta: 0,
      otherAllowance: 0,
      bonus: 0,
      healthInsurance: 0,
      grossSalary: 50000,
      totalDeductions: 0,
      netSalary: 50000,
      ctc: 600000,
      effectiveFrom: dayjs("2026-01-01"),
      effectiveTo: null,
      paymentFrequency: "Monthly",
      currency: "INR",
      status: true,
    } satisfies SalaryModel;
    vi.mocked(payrollServices.saveEmployeeSalaryStructure).mockClear();
    await renderSalaryForm([], formRef, undefined, legacySalary);

    await act(async () => { await formRef.current?.submitForm(); });

    const payload = vi.mocked(payrollServices.saveEmployeeSalaryStructure).mock.calls.at(-1)?.[0];
    expect(payload?.userId).toBe("user-1");
    expect(payload?.employeeId).toBe("employee-1");
  });

  it("excludes aggregate deduction totals from the form and saved salary components", async () => {
    const formRef: { current: FormikProps<CreateEmployeeSalary> | null } = { current: null };
    await renderSalaryForm([{ id: "total", code: "TOTAL_DEDUCTIONS", name: "Total Deductions", kind: "DEDUCTION",
      calculationType: "FIXED", isTaxable: false, isActive: true, effectiveFrom: "2026-01-01", version: 1 }], formRef);
    expect(container.querySelector('input[name="totalDeductions"]')).toBeNull();
    await act(async () => { await formRef.current?.submitForm(); });
    const payload = vi.mocked(payrollServices.saveEmployeeSalaryStructure).mock.calls.at(-1)?.[0];
    expect(payload?.components.some((item) => item.componentCode === "TOTAL_DEDUCTIONS")).toBe(false);
  });

  it("shows only enabled standard components and active custom company components", async () => {
    await renderSalaryForm([
      { id: "bonus", code: "BONUS", name: "Bonus", kind: "EARNING", calculationType: "FIXED", isTaxable: true, isActive: true, effectiveFrom: "2026-01-01", version: 1 },
      { id: "hra", code: "HRA", name: "HRA", kind: "EARNING", calculationType: "FIXED", isTaxable: true, isActive: false, effectiveFrom: "2026-01-01", version: 1 },
      { id: "meal", code: "MEAL_ALLOWANCE", name: "Meal allowance", kind: "EARNING", calculationType: "FIXED", isTaxable: true, isActive: true, effectiveFrom: "2026-01-01", version: 1 },
      { id: "travel", code: "TRAVEL", name: "Travel", kind: "EARNING", calculationType: "FIXED", isTaxable: true, isActive: true, effectiveFrom: "2027-01-01", version: 1 },
    ]);

    expect(container.querySelector('input[name="basicPay"]')).not.toBeNull();
    expect(container.querySelector('input[name="bonus"]')).not.toBeNull();
    expect(container.querySelector('input[name="hra"]')).toBeNull();
    expect(container.querySelector('input[name="MEAL_ALLOWANCE"]')).not.toBeNull();
    expect(container.querySelector('input[name="TRAVEL"]')).toBeNull();
  });

  it("persists only company-enabled optional components in the salary draft", async () => {
    const formRef: { current: FormikProps<CreateEmployeeSalary> | null } = { current: null };
    await renderSalaryForm([
      { id: "bonus", code: "BONUS", name: "Bonus", kind: "EARNING", calculationType: "FIXED", isTaxable: true, isActive: true, effectiveFrom: "2026-01-01", version: 1 },
      { id: "hra", code: "HRA", name: "HRA", kind: "EARNING", calculationType: "FIXED", isTaxable: true, isActive: false, effectiveFrom: "2026-01-01", version: 1 },
    ], formRef);

    await act(async () => { await formRef.current?.submitForm(); });

    const payload = vi.mocked(payrollServices.saveEmployeeSalaryStructure).mock.calls.at(-1)?.[0];
    expect(payload?.components.map((component) => component.componentCode)).toContain("BASIC");
    expect(payload?.components.map((component) => component.componentCode)).toContain("BONUS");
    expect(payload?.components.map((component) => component.componentCode)).not.toContain("HRA");
  });

  it("labels formula values as rates and calculates the saved gross from the configured base", async () => {
    const formRef: { current: FormikProps<CreateEmployeeSalary> | null } = { current: null };
    await renderSalaryForm([{
      id: "hra-v1", code: "HRA", name: "Housing allowance", kind: "EARNING",
      calculationType: "PERCENT_OF_COMPONENT", baseComponentCode: "BASIC",
      isTaxable: true, isActive: true, effectiveFrom: "2026-01-01", version: 1,
    }, {
      id: "deduction-v1", code: "MEDICAL_INSURANCE", name: "Medical insurance", kind: "DEDUCTION",
      calculationType: "FIXED", isTaxable: false, isActive: true, effectiveFrom: "2026-01-01", version: 1,
    }], formRef);

    expect(container.querySelector('input[name="hra"]')?.parentElement?.querySelector("[data-value-unit='%']")?.textContent).toBe("%");
    expect(container.textContent).toContain("percentage of BASIC");
    await act(async () => {
      await formRef.current?.setValues((current) => ({ ...current, basicPay: 10000, hra: 40, MEDICAL_INSURANCE: 1000 }));
    });
    expect(formRef.current?.values).toMatchObject({ basicPay: 10000, hra: 40, MEDICAL_INSURANCE: 1000 });
    expect(container.querySelector('[data-testid="salary-preview-gross"]')?.textContent).toContain("14,000.00");
    expect(container.querySelector('[data-testid="salary-preview-deductions"]')?.textContent).toContain("1,000.00");
    expect(container.querySelector('[data-testid="salary-preview-net"]')?.textContent).toContain("13,000.00");
    await act(async () => { await formRef.current?.submitForm(); });

    const payload = vi.mocked(payrollServices.saveEmployeeSalaryStructure).mock.calls.at(-1)?.[0];
    expect(payload?.components.find((component) => component.componentCode === "HRA")?.value).toBe(40);
    expect(payload?.components.find((component) => component.componentCode === "MEDICAL_INSURANCE")?.value).toBe(1000);
    expect(payload?.monthlyGross).toBe(14000);
    expect(payload?.annualCtc).toBe(168000);
  });

  it("hides optional component fields when explicitly disabled in company settings", async () => {
    await renderSalaryForm([
      { id: "bonus", code: "BONUS", name: "Bonus", kind: "EARNING", calculationType: "FIXED", isTaxable: true, isActive: false, effectiveFrom: "2026-01-01", version: 1 },
      { id: "hra", code: "HRA", name: "HRA", kind: "EARNING", calculationType: "FIXED", isTaxable: true, isActive: true, effectiveFrom: "2026-01-01", version: 1 },
    ]);

    expect(container.querySelector('input[name="bonus"]')).toBeNull();
    expect(container.querySelector('input[name="hra"]')).not.toBeNull();
  });

  it("clears fixed salary values from the prior template when switching templates", async () => {
    const formRef: { current: FormikProps<CreateEmployeeSalary> | null } = { current: null };
    vi.mocked(payrollServices.getPayrollSalaryTemplates).mockResolvedValueOnce({ data: [
      { id: "senior", name: "Senior", components: [
        { code: "BASIC", name: "Basic", kind: "EARNING", calculationType: "FIXED", value: 100000, isTaxable: true, sortOrder: 1 },
        { code: "BONUS", name: "Bonus", kind: "EARNING", calculationType: "FIXED", value: 5000, isTaxable: true, sortOrder: 2 },
      ], effectiveFrom: "2026-01-01", isActive: true, version: 1 },
      { id: "junior", name: "Junior", components: [
        { code: "BASIC", name: "Basic", kind: "EARNING", calculationType: "FIXED", value: 50000, isTaxable: true, sortOrder: 1 },
      ], effectiveFrom: "2026-01-01", isActive: true, version: 1 },
    ] } as Awaited<ReturnType<typeof payrollServices.getPayrollSalaryTemplates>>);
    await renderSalaryForm([
      { id: "bonus", code: "BONUS", name: "Bonus", kind: "EARNING", calculationType: "FIXED", isTaxable: true, isActive: true, effectiveFrom: "2026-01-01", version: 1 },
    ], formRef);
    const templateSelect = container.querySelectorAll<HTMLSelectElement>("select")[0];
    expect(templateSelect).not.toBeNull();

    await act(async () => {
      templateSelect!.value = "senior";
      templateSelect!.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(container.querySelector<HTMLInputElement>('input[name="bonus"]')?.value).toBe("5000");

    await act(async () => {
      templateSelect!.value = "junior";
      templateSelect!.dispatchEvent(new Event("change", { bubbles: true }));
    });

    expect(container.querySelector<HTMLInputElement>('input[name="basicPay"]')?.value).toBe("50000");
    expect(container.querySelector<HTMLInputElement>('input[name="bonus"]')?.value).toBe("0");
    await act(async () => { await formRef.current?.submitForm(); });
    const payload = vi.mocked(payrollServices.saveEmployeeSalaryStructure).mock.calls.at(-1)?.[0];
    expect(payload?.components.find((component) => component.componentCode === "BONUS")?.value).toBe(0);
  });

  it("loads template fixed fields and custom components into the employee salary form", async () => {
    vi.mocked(payrollServices.getPayrollSalaryTemplates).mockResolvedValueOnce({ data: [
      { id: "offer-package", name: "Offer package", basicPay: 72000, hra: 18000, lta: 4000, otherAllowance: 2500, bonus: 3000,
        components: [{ code: "MEAL", name: "Meal", kind: "EARNING", calculationType: "FIXED", value: 1500, isTaxable: true, sortOrder: 1 }],
        effectiveFrom: "2026-01-01", isActive: true, version: 1 },
    ] } as Awaited<ReturnType<typeof payrollServices.getPayrollSalaryTemplates>>);
    const formRef: { current: FormikProps<CreateEmployeeSalary> | null } = { current: null };
    await renderSalaryForm([
      { id: "meal-v1", code: "MEAL", name: "Meal", kind: "EARNING", calculationType: "FIXED", isTaxable: true, isActive: true, effectiveFrom: "2026-01-01", version: 1 },
    ], formRef);
    const templateSelect = container.querySelectorAll<HTMLSelectElement>("select")[0];

    await act(async () => {
      templateSelect!.value = "offer-package";
      templateSelect!.dispatchEvent(new Event("change", { bubbles: true }));
    });

    expect(formRef.current?.values).toMatchObject({
      basicPay: 72000, hra: 18000, lta: 4000, otherAllowance: 2500, bonus: 3000, MEAL: 1500,
    });
  });

  it("clears custom component values from the previous template when switching templates", async () => {
    vi.mocked(payrollServices.getPayrollSalaryTemplates).mockResolvedValueOnce({ data: [
      { id: "with-meal", name: "With meal", components: [{ code: "MEAL", name: "Meal", kind: "EARNING", calculationType: "FIXED", value: 1200, isTaxable: true, sortOrder: 1 }], effectiveFrom: "2026-01-01", isActive: true, version: 1 },
      { id: "without-meal", name: "Without meal", components: [], effectiveFrom: "2026-01-01", isActive: true, version: 1 },
    ] } as Awaited<ReturnType<typeof payrollServices.getPayrollSalaryTemplates>>);
    const formRef: { current: FormikProps<CreateEmployeeSalary> | null } = { current: null };
    await renderSalaryForm([
      { id: "meal-v1", code: "MEAL", name: "Meal", kind: "EARNING", calculationType: "FIXED", isTaxable: true, isActive: true, effectiveFrom: "2026-01-01", version: 1 },
    ], formRef);
    const templateSelect = container.querySelectorAll<HTMLSelectElement>("select")[0];

    await act(async () => {
      templateSelect!.value = "with-meal";
      templateSelect!.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await act(async () => {
      templateSelect!.value = "without-meal";
      templateSelect!.dispatchEvent(new Event("change", { bubbles: true }));
    });

    expect((formRef.current?.values as CreateEmployeeSalary & Record<string, unknown>).MEAL).toBe(0);
  });
});
