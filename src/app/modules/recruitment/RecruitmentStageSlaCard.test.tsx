import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RecruitmentStageSlaCard from "./RecruitmentStageSlaCard";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mockGetReport = vi.fn();
const mockGetPolicies = vi.fn();
const mockUpsert = vi.fn();

vi.mock("./services", () => ({
  getRecruitmentStageSla: (...args: unknown[]) => mockGetReport(...args),
  getRecruitmentSlaPolicies: (...args: unknown[]) => mockGetPolicies(...args),
  upsertRecruitmentSlaPolicy: (...args: unknown[]) => mockUpsert(...args),
}));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));
vi.mock("../theme/useIsDark", () => ({ useIsDark: () => false }));

const roots: Root[] = [];
const successfulResponse = () => ({ data: { success: true, methodResult: [] } });

describe("RecruitmentStageSlaCard", () => {
  beforeEach(() => {
    mockGetReport.mockResolvedValue({ data: { success: true, methodResult: { totalTrackedApplications: 1, overdueApplications: 1, items: [{ applicantId: "app-12345678", vacancyId: "job-1", vacancyTitle: "QA Engineer", stage: "Screening", location: "Pune", enteredStageAtUtc: "2026-11-17T12:00:00Z", dueAtUtc: "2026-11-18T12:00:00Z", hoursInStage: 30, targetHours: 24, overdue: true }] } } });
    mockGetPolicies.mockResolvedValue({ data: { success: true, methodResult: [{ policyId: "policy-1", stage: "Screening", location: "Pune", targetHours: 24, enabled: true }] } });
    mockUpsert.mockResolvedValue(successfulResponse());
  });

  afterEach(() => {
    while (roots.length) act(() => roots.pop()?.unmount());
    vi.clearAllMocks();
  });

  it("shows stage aging and the company-configured policy", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);
    await act(async () => { root.render(<RecruitmentStageSlaCard />); });
    await act(async () => Promise.resolve());

    expect(container.textContent).toContain("Application stage aging");
    expect(container.textContent).toContain("1 overdue");
    expect(container.textContent).toContain("QA Engineer · Screening");
    expect(container.textContent).toContain("Screening · Pune · 24 hours");
  });
});
