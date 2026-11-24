import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RecruitmentPipelineSummaryCard from "./RecruitmentPipelineSummaryCard";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const { getRecruitmentAnalytics } = vi.hoisted(() => ({ getRecruitmentAnalytics: vi.fn() }));
vi.mock("../../services", () => ({ getRecruitmentAnalytics: (...args: unknown[]) => getRecruitmentAnalytics(...args) }));

const roots: Root[] = [];

describe("RecruitmentPipelineSummaryCard source analytics", () => {
  beforeEach(() => {
    getRecruitmentAnalytics.mockResolvedValue({
      data: {
        success: true,
        methodResult: {
          totalApplicants: 3,
          activeApplicants: 3,
          rejectedApplicants: 0,
          mergedApplicants: 0,
          byStage: { New: 3 },
          byCandidateReportedSource: { "Employee referral": 2, "Not reported": 1 },
        },
      },
    });
  });

  afterEach(() => {
    while (roots.length) roots.pop()?.unmount();
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("shows source counts with a clear self-reported attribution label", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    await act(async () => root.render(<RecruitmentPipelineSummaryCard />));
    await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));

    expect(container.textContent).toContain("Candidate-reported sources");
    expect(container.textContent).toContain("self-reported");
    expect(container.textContent).toContain("Employee referral");
    expect(container.textContent).toContain("2 · 67%");
    expect(container.textContent).toContain("Not reported");
  });

  it("does not render the source section when the API has no source breakdown", async () => {
    getRecruitmentAnalytics.mockResolvedValueOnce({ data: { success: true, methodResult: { totalApplicants: 0, byStage: {}, byCandidateReportedSource: {} } } });
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    await act(async () => root.render(<RecruitmentPipelineSummaryCard />));
    await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));

    expect(container.textContent).not.toContain("Candidate-reported sources");
  });
});
