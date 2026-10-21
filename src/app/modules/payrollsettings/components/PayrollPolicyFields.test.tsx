import React, { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PayrollPolicyFields } from "./PayrollPolicyFields";
import type { PayrollDivisorPolicyConfig } from "./PayrollConfigurationPanel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const initialConfig: PayrollDivisorPolicyConfig = {
  payrollMode: "Standard",
  divisorPolicy: "CALENDAR_DAYS",
  lopCalculationBase: "FIXED_GROSS",
  epfMode: "EXEMPT",
  epfWageCeiling: 15000,
  epfEmployeeRatePercent: 12,
  epfEmployerRatePercent: 12,
  esicMode: "EXEMPT",
  esicWageCeiling: 21000,
  esicEmployeeRatePercent: 0.75,
  esicEmployerRatePercent: 3.25,
  tdsMode: "MANUAL_ONLY",
  requireAttendanceLock: false,
  effectiveFrom: "2026-09-01",
  isActive: true,
  version: 1,
};

const roots: Root[] = [];

function renderFields(canEdit = true, componentFeatures: Array<{ id?: string; code: string; name: string; kind: "EARNING" | "DEDUCTION"; calculationType: "FIXED" | "PERCENT_OF_GROSS" | "PERCENT_OF_COMPONENT"; isTaxable: boolean; isActive: boolean }> = []) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push(root);
  const onSaveLopBase = vi.fn();
  const onOpenComponents = vi.fn();
  const onOpenGroups = vi.fn();
  const onOpenTemplates = vi.fn();
  const onToggleComponent = vi.fn();
  function Harness() {
    const [config, setConfig] = useState(initialConfig);
    return <PayrollPolicyFields config={config} canEdit={canEdit} onChange={setConfig}
      onSaveLopBase={onSaveLopBase} savingLopBase={false}
      onOpenComponents={onOpenComponents} onOpenGroups={onOpenGroups} onOpenTemplates={onOpenTemplates}
      componentFeatures={componentFeatures} onToggleComponent={onToggleComponent} componentsBusy={false} />;
  }
  return { root, container, Harness, onSaveLopBase, onOpenComponents, onOpenGroups, onOpenTemplates, onToggleComponent };
}

function checkbox(label: string) {
  const wrapper = Array.from(document.querySelectorAll("label")).find((item) => item.textContent?.includes(label));
  const input = wrapper?.querySelector<HTMLInputElement>('input[type="checkbox"]');
  if (!input) throw new Error(`Missing checkbox: ${label}`);
  return input;
}

describe("PayrollPolicyFields", { timeout: 15000 }, () => {
  afterEach(async () => {
    for (const root of roots.splice(0)) await act(async () => root.unmount());
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });
  it("shows settings only for features selected by the company", async () => {
    const { root, Harness } = renderFields();
    await act(async () => root.render(<Harness />));
    expect(document.body.textContent).toContain("0 selected");
    expect(document.body.textContent).toContain("Statutory and tax");
    expect(document.body.textContent).toContain("Earnings and deductions");
    expect(document.body.textContent).toContain("2. Configure selected features");
    expect(document.querySelector('[data-testid="payroll-feature-selection-step"]')?.className).toContain("MuiGrid-grid-xs-12");
    expect(document.querySelector('[data-testid="payroll-feature-configuration-step"]')?.className).toContain("MuiGrid-grid-xs-12");
    expect(document.body.querySelector('input[aria-label="EPF wage ceiling (₹)"]')).toBeNull();
    expect(document.body.textContent).not.toContain("Attendance readiness gate");

    await act(async () => checkbox("Provident Fund (EPF)").click());
    expect(document.body.textContent).toContain("1 selected");
    expect(document.body.textContent).toContain("Employee contribution (%)");
    expect(document.body.textContent).toContain("Employer contribution (%)");
    expect(document.querySelectorAll('input[type="number"]')).toHaveLength(3);
    await act(async () => checkbox("State Insurance (ESIC)").click());
    expect(document.querySelectorAll('input[type="number"]')).toHaveLength(6);
    expect(document.body.textContent).toContain("EPF wage ceiling (₹)");

    await act(async () => checkbox("Attendance lock").click());
    expect(document.body.textContent).toContain("Attendance readiness gate");
    await act(async () => checkbox("Provident Fund (EPF)").click());
    expect(document.body.textContent).not.toContain("EPF wage ceiling (₹)");
  });

  it("disables editing for viewers while keeping setup navigation available", async () => {
    const { root, Harness, onOpenComponents, onOpenGroups } = renderFields(false);
    await act(async () => root.render(<Harness />));
    expect(checkbox("Provident Fund (EPF)").disabled).toBe(true);
    expect(document.body.textContent).not.toContain("Save unpaid leave base");
    const groups = Array.from(document.querySelectorAll("button")).find((item) => item.textContent?.includes("Pay groups"));
    await act(async () => groups?.click());
    expect(onOpenGroups).toHaveBeenCalledOnce();
    const components = Array.from(document.querySelectorAll("button")).find((item) => item.textContent?.includes("Bonus and components"));
    await act(async () => components?.click());
    expect(onOpenComponents).toHaveBeenCalledOnce();
  });

  it("shows company salary components beside statutory feature checkboxes", async () => {
    const bonus = { id: "bonus-v1", code: "BONUS", name: "Performance bonus", kind: "EARNING" as const, calculationType: "FIXED" as const, isTaxable: true, isActive: false };
    const { root, Harness, onToggleComponent } = renderFields(true, [bonus]);
    await act(async () => root.render(<Harness />));

    expect(document.body.textContent).toContain("Performance bonus");
    expect(document.body.textContent).toContain("0 selected");
    const includeBonus = checkbox("Performance bonus");
    expect(includeBonus.checked).toBe(false);
    await act(async () => includeBonus.click());
    expect(onToggleComponent).toHaveBeenCalledWith(bonus, true);
    expect(document.body.textContent).toContain("salary structure");
  });
});
