import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RecruitmentInterviewPlanEditor from "./RecruitmentInterviewPlanEditor";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const mockGetVacancies = vi.fn();
const mockGetPlan = vi.fn();
const mockSavePlan = vi.fn();

vi.mock("./services", () => ({
  getAllJobVacancies: (...args: unknown[]) => mockGetVacancies(...args),
  getRecruitmentInterviewPlan: (...args: unknown[]) => mockGetPlan(...args),
  upsertRecruitmentInterviewPlan: (...args: unknown[]) => mockSavePlan(...args),
}));

vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warn: vi.fn() } }));
vi.mock("../theme/useIsDark", () => ({ useIsDark: () => false }));

const roots: Root[] = [];

describe("RecruitmentInterviewPlanEditor", () => {
  beforeEach(() => {
    mockGetVacancies.mockResolvedValue({ data: { success: true, methodResults: [] } });
    mockGetPlan.mockResolvedValue({
      data: { success: false, errorCode: "REC_FEATURE_DISABLED", message: "Interview scorecard plans are disabled." },
    });
  });

  afterEach(() => {
    while (roots.length > 0) act(() => roots.pop()?.unmount());
    vi.clearAllMocks();
  });

  it("explains the disabled scorecard capability and hides the editable default plan", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    await act(async () => {
      root.render(<RecruitmentInterviewPlanEditor />);
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(container.textContent).toContain("Interview scorecard planning is turned off for this company");
    expect(container.textContent).toContain("Stage gates");
    expect(container.textContent).toContain("Structured scorecards");
    expect(Array.from(container.querySelectorAll("button")).some((button) => button.textContent?.includes("Save plan"))).toBe(false);
    expect(container.textContent).toContain("Check again");
  });

  it("does not present default scorecard settings as loaded when the API is unavailable", async () => {
    mockGetPlan.mockRejectedValueOnce(new Error("Network unavailable"));
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    await act(async () => {
      root.render(<RecruitmentInterviewPlanEditor />);
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(container.textContent).toContain("Interview scorecard planning is unavailable");
    expect(container.textContent).toContain("Network unavailable");
    expect(Array.from(container.querySelectorAll("button")).some((button) => button.textContent?.includes("Save plan"))).toBe(false);
  });
});
