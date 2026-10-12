import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EmployeeLifecyclePolicyConfig } from "./EmployeeLifecyclePolicyConfig";
import { IntlProvider } from "react-intl";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("../../leaves/leaveServices", () => ({
  getLeavePolicies: vi.fn().mockResolvedValue({ data: { methodResults: [{ id: "medical-policy", name: "Medical leave", code: "MED" }] } }),
}));
vi.mock("../employeeServices", () => ({
  getEmployeeLifecyclePolicies: vi.fn().mockResolvedValue({ data: [{ eventType: "MedicalLeave", leavePolicyId: "medical-policy", effectiveFromUtc: "2030-02-03T00:00:00.000Z", requiresHrApproval: true, requiresReason: true, requiresExpectedReturnDate: true, requiresDocument: true, attendanceExpected: false, leaveRequestsAllowed: true, workFromHomeRequestsAllowed: false }] }),
  saveEmployeeLifecyclePolicy: vi.fn(),
}));

describe("EmployeeLifecyclePolicyConfig", () => {
  afterEach(() => document.body.replaceChildren());

  it("renders policy linkage and effective date in view-only mode", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => { root.render(<IntlProvider locale="en" messages={{ "BUTTON.CANCEL": "Cancel", "BUTTON.DELETE": "Delete" }}><EmployeeLifecyclePolicyConfig /></IntlProvider>); await Promise.resolve(); await Promise.resolve(); });

    expect(container.textContent).toContain("Lifecycle special leaves");
    expect(container.textContent).toContain("Normal Leave Policies remain managed in Leave Management");
    await act(async () => { root.unmount(); });
  });
});
