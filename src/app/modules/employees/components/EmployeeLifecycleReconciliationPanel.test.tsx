import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EmployeeLifecycleReconciliationPanel } from "./EmployeeLifecycleReconciliationPanel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("../employeeServices", () => ({
  getEmployeeLifecycleCases: vi.fn().mockResolvedValue({ data: { methodResults: [
    { caseId: "case-1", leaveTotalDays: 12, leaveReconciliationStatus: "Reconciled" },
    { caseId: "case-2", leaveTotalDays: 3, leaveReconciliationStatus: "Pending" },
  ] } }),
}));

describe("EmployeeLifecycleReconciliationPanel", () => {
  afterEach(() => document.body.replaceChildren());

  it("shows the read-only reconciliation snapshot", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => { root.render(<EmployeeLifecycleReconciliationPanel />); await Promise.resolve(); await Promise.resolve(); });

    expect(container.textContent).toContain("Leave-to-employment reconciliation");
    expect(container.textContent).toContain("2 linked cases");
    expect(container.textContent).toContain("15 leave days");
    expect(container.textContent).toContain("Reconciled: 1");
    expect(container.textContent).toContain("Pending: 1");
    await act(async () => { root.unmount(); });
  });
});
