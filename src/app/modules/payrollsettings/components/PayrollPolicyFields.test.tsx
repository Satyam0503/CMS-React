import React, { useState } from "react";
import { act } from "react-dom/test-utils";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PayrollPolicyFields } from "./PayrollPolicyFields";
import type { PayrollDivisorPolicyConfig } from "./PayrollConfigurationPanel";

const initialConfig: PayrollDivisorPolicyConfig = {
  payrollMode: "Standard",
  divisorPolicy: "CALENDAR_DAYS",
  lopCalculationBase: "FIXED_GROSS",
  epfMode: "EXEMPT",
  epfWageCeiling: 15000,
  esicMode: "EXEMPT",
  esicWageCeiling: 21000,
  tdsMode: "MANUAL_ONLY",
  requireAttendanceLock: false,
  effectiveFrom: "2026-09-01",
  isActive: true,
  version: 1,
};

const roots: Root[] = [];

function renderFields(canEdit = true) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push(root);
  const onSaveLopBase = vi.fn();
  const onOpenComponents = vi.fn();
  const onOpenGroups = vi.fn();
  const onOpenTemplates = vi.fn();
  function Harness() {
    const [config, setConfig] = useState(initialConfig);
    return <PayrollPolicyFields config={config} canEdit={canEdit} onChange={setConfig}
      onSaveLopBase={onSaveLopBase} savingLopBase={false}
      onOpenComponents={onOpenComponents} onOpenGroups={onOpenGroups} onOpenTemplates={onOpenTemplates} />;
  }
  return { root, container, Harness, onSaveLopBase, onOpenComponents, onOpenGroups, onOpenTemplates };
}

function checkbox(label: string) {
  const wrapper = Array.from(document.querySelectorAll("label")).find((item) => item.textContent?.includes(label));
  const input = wrapper?.querySelector<HTMLInputElement>('input[type="checkbox"]');
  if (!input) throw new Error(`Missing checkbox: ${label}`);
  return input;
}

afterEach(async () => {
  for (const root of roots.splice(0)) await act(async () => root.unmount());
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

describe("PayrollPolicyFields", () => {
  it("shows settings only for features selected by the company", async () => {
    const { root, Harness } = renderFields();
    await act(async () => root.render(<Harness />));
    expect(document.body.textContent).toContain("0 selected");
    expect(document.body.querySelector('input[aria-label="EPF wage ceiling (₹)"]')).toBeNull();
    expect(document.body.textContent).not.toContain("Attendance readiness gate");

    await act(async () => checkbox("Provident Fund (EPF)").click());
    expect(document.body.textContent).toContain("1 selected");
    expect(document.body.textContent).toContain("EPF wage ceiling (₹)");

    await act(async () => checkbox("Attendance lock").click());
    expect(document.body.textContent).toContain("Attendance readiness gate");
    await act(async () => checkbox("Provident Fund (EPF)").click());
    expect(document.body.textContent).not.toContain("EPF wage ceiling (₹)");
  });

  it("disables editing for viewers while keeping setup navigation available", async () => {
    const { root, Harness, onOpenGroups } = renderFields(false);
    await act(async () => root.render(<Harness />));
    expect(checkbox("Provident Fund (EPF)").disabled).toBe(true);
    expect(document.body.textContent).not.toContain("Save unpaid leave base");
    const groups = Array.from(document.querySelectorAll("button")).find((item) => item.textContent?.includes("Pay groups"));
    await act(async () => groups?.click());
    expect(onOpenGroups).toHaveBeenCalledOnce();
  });
});
