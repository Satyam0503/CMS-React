import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EmployeeLifecyclePolicyConfig } from "./EmployeeLifecyclePolicyConfig";

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
    await act(async () => { root.render(<EmployeeLifecyclePolicyConfig />); await Promise.resolve(); await Promise.resolve(); });

    expect(container.textContent).toContain("Lifecycle policy reference");
    expect(container.textContent).toContain("cannot create a second or conflicting lifecycle policy");
    expect(container.textContent).toContain("Effective from");
    expect(container.textContent).toContain("UTC policy start date");
    expect(container.querySelectorAll("input:disabled").length).toBeGreaterThan(0);
    await act(async () => { root.unmount(); });
  });
});
