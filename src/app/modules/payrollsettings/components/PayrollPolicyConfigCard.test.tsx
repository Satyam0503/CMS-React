import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PayrollPolicyConfigCard, type PayrollDivisorPolicyConfig } from "./PayrollPolicyConfigCard";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("@mui/icons-material", () => ({
  AccountBalanceOutlined: () => null,
  CalendarMonthOutlined: () => null,
  HealthAndSafetyOutlined: () => null,
  LockClockOutlined: () => null,
  ReceiptLongOutlined: () => null,
  SaveRounded: () => null,
  ShieldOutlined: () => null,
  TuneRounded: () => null,
}));

describe("PayrollPolicyConfigCard", () => {
  let root: Root | undefined;
  let container: HTMLDivElement | undefined;

  afterEach(async () => {
    if (root) await act(async () => root?.unmount());
    root = undefined;
    container?.remove();
    container = undefined;
  });

  it("shows independent policy controls without company-size presets", async () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    const policyConfig: PayrollDivisorPolicyConfig = {
      payrollMode: "Standard",
      divisorPolicy: "CALENDAR_DAYS",
      lopCalculationBase: "FIXED_GROSS",
      epfMode: "CAPPED_CEILING",
      epfWageCeiling: 15000,
      esicMode: "STATUTORY",
      tdsMode: "AUTO_NEW_REGIME",
      requireAttendanceLock: true,
      effectiveFrom: "2026-10-01",
      isActive: true,
      version: 1,
    };

    await act(async () => root?.render(
      <PayrollPolicyConfigCard
        policyConfig={policyConfig}
        setPolicyConfig={vi.fn()}
        policyExpanded
        setPolicyExpanded={vi.fn()}
        handleSavePolicyConfig={vi.fn()}
        isSavingPolicy={false}
        canSavePolicy
      />,
    ));

    expect(container.textContent).toContain("Divisor & LOP Rules");
    expect(container.textContent).toContain("Provident Fund (EPF)");
    expect(container.textContent).toContain("State Insurance (ESIC)");
    expect(container.textContent).toContain("Income Tax (TDS) Engine");
    expect(container.textContent).not.toMatch(/Startup Mode|Standard SME|Enterprise Compliance|Recommended Company Profile Presets/);
    expect(container.textContent).not.toContain("Standard Profile");
  });
});
