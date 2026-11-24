import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RecruitmentFeedbackSlaCard from "./RecruitmentFeedbackSlaCard";
import { toast } from "react-toastify";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const mockGetReport = vi.fn();
const mockQueueReminders = vi.fn();

vi.mock("./services", () => ({
  getRecruitmentFeedbackSla: (...args: unknown[]) => mockGetReport(...args),
  queueRecruitmentFeedbackReminders: (...args: unknown[]) => mockQueueReminders(...args),
}));

vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));
vi.mock("../theme/useIsDark", () => ({ useIsDark: () => false }));

const roots: Root[] = [];

describe("RecruitmentFeedbackSlaCard", () => {
  beforeEach(() => {
    mockGetReport.mockResolvedValue({
      data: { success: false, errorCode: "REC_FEATURE_DISABLED", message: "Feedback SLA tracking is disabled." },
    });
  });

  afterEach(() => {
    while (roots.length > 0) act(() => roots.pop()?.unmount());
    vi.clearAllMocks();
  });

  it("shows the setting path when SLA tracking is disabled instead of rendering a blank card", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    await act(async () => {
      root.render(<RecruitmentFeedbackSlaCard />);
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(container.textContent).toContain("Interviewer feedback SLA tracking is turned off for this company");
    expect(container.textContent).toContain("Operating model");
    expect(container.textContent).toContain("Enterprise Operations");
    expect(container.textContent).toContain("Check again");
    expect(container.textContent).not.toContain("Remind panel");
  });

  it("keeps the SLA report visible when only reminder email automation is disabled", async () => {
    mockGetReport.mockResolvedValue({
      data: {
        success: true,
        methodResult: { totalOpenRounds: 1, overdueRounds: 1, items: [] },
      },
    });
    mockQueueReminders.mockResolvedValue({
      data: { success: false, errorCode: "REC_FEATURE_DISABLED", message: "Recruitment automation is not enabled for this company." },
    });
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    await act(async () => {
      root.render(<RecruitmentFeedbackSlaCard />);
    });
    await act(async () => Promise.resolve());

    const button = [...container.querySelectorAll("button")].find((item) => item.textContent?.includes("Remind panel"));
    expect(button).toBeDefined();
    await act(async () => {
      button?.click();
      await Promise.resolve();
    });

    expect(container.textContent).toContain("1 open");
    expect(container.textContent).toContain("1 overdue");
    expect(container.textContent).not.toContain("turned off for this company");
    expect(toast.info).toHaveBeenCalledWith("Recruitment automation is not enabled for this company.");
  });
});
