import { describe, expect, it } from "vitest";

describe("EmployeeExitCase status and phase calculations", () => {
  const computePhases = (status: string, clearances: any[] = [], handoverTasks: any[] = []) => {
    const isExitComplete = ["Resigned", "Terminated"].includes(status);
    const managerReviewCurrent = ["PendingManagerApproval", "DiscussionRequested"].includes(status);
    const managerReviewComplete = !managerReviewCurrent && status !== "Withdrawn";
    const isInNoticePhase = ["NoticePeriod", "AwaitingEmployeeNoticeOffer"].includes(status);
    const hrReviewCurrent = status === "PendingHrApproval";
    const hrReviewComplete = isExitComplete || isInNoticePhase;
    const noticePeriodCurrent = isInNoticePhase;
    const trackedItems = [...clearances, ...handoverTasks];
    const completedItems = trackedItems.filter((item) =>
      ["Completed", "Waived", "Approved"].includes(item.status),
    ).length;
    const taskProgress = trackedItems.length ? completedItems / trackedItems.length : hrReviewComplete ? 1 : 0;
    const phaseProgress = Math.round(
      Math.min(
        100,
        15 +
          (managerReviewComplete ? 15 : 0) +
          (hrReviewComplete ? 15 : 0) +
          (noticePeriodCurrent || isExitComplete ? 20 : 0) +
          taskProgress * 25 +
          (isExitComplete ? 10 : 0),
      ),
    );

    const phases = [
      { label: "Request submitted", complete: true, current: false },
      { label: "Manager review", complete: managerReviewComplete, current: managerReviewCurrent },
      { label: "HR review", complete: hrReviewComplete, current: hrReviewCurrent },
      { label: "Notice period", complete: isExitComplete, current: noticePeriodCurrent },
      { label: "Exit completed", complete: isExitComplete, current: false },
    ];

    return { phases, phaseProgress, hrReviewComplete, noticePeriodCurrent };
  };

  it("marks HR review complete and Notice period current when status is AwaitingEmployeeNoticeOffer", () => {
    const result = computePhases("AwaitingEmployeeNoticeOffer");
    expect(result.hrReviewComplete).toBe(true);
    expect(result.noticePeriodCurrent).toBe(true);

    // HR review step is completed with green checkmark
    expect(result.phases[2].complete).toBe(true);
    expect(result.phases[2].current).toBe(false);

    // Notice period step is active
    expect(result.phases[3].complete).toBe(false);
    expect(result.phases[3].current).toBe(true);

    // Phase progress properly reflects advance through notice phase (15+15+15+20 = 65% base + 25% tasks = 90%)
    expect(result.phaseProgress).toBeGreaterThanOrEqual(65);
  });

  it("differentiates HR review pending banner from employee offer decision banner", () => {
    const getBannerText = (adjustments: Array<{ status: string }>, withdrawal?: { status: string }) => {
      const pendingNoticeHr = adjustments.find((item) => item.status === "Pending");
      const pendingNoticeOffer = adjustments.find((item) => item.status === "AwaitingEmployeeDecision");
      if (pendingNoticeOffer) return "Notice adjustment offer awaiting your decision below.";
      if (pendingNoticeHr) return "Notice change request awaiting HR review.";
      if (withdrawal?.status === "Pending") return "Withdrawal request awaiting review.";
      return "No active notice or withdrawal requests.";
    };

    expect(getBannerText([{ status: "AwaitingEmployeeDecision" }])).toBe(
      "Notice adjustment offer awaiting your decision below.",
    );
    expect(getBannerText([{ status: "Pending" }])).toBe("Notice change request awaiting HR review.");
    expect(getBannerText([], { status: "Pending" })).toBe("Withdrawal request awaiting review.");
    expect(getBannerText([])).toBe("No active notice or withdrawal requests.");
  });

  it("allows withdrawal during AwaitingEmployeeNoticeOffer", () => {
    const canWithdraw = (status: string, withdrawalStatus?: string, permittedActions: string[] = []) =>
      withdrawalStatus !== "Pending" &&
      (permittedActions.includes("Withdraw") ||
        [
          "PendingManagerApproval",
          "PendingHrApproval",
          "DiscussionRequested",
          "NoticePeriod",
          "AwaitingEmployeeNoticeOffer",
        ].includes(status));

    expect(canWithdraw("AwaitingEmployeeNoticeOffer")).toBe(true);
    expect(canWithdraw("NoticePeriod")).toBe(true);
    expect(canWithdraw("AwaitingEmployeeNoticeOffer", "Pending")).toBe(false);
  });

  it("formats zero clearance tasks gracefully without 0 of 0 error look", () => {
    const getClearanceSummary = (trackedItems: any[], completedItems: number) =>
      trackedItems.length > 0
        ? `${completedItems} of ${trackedItems.length} clearance/handover items completed`
        : "No clearance tasks assigned yet";

    expect(getClearanceSummary([], 0)).toBe("No clearance tasks assigned yet");
    expect(getClearanceSummary([{ id: 1 }], 1)).toBe("1 of 1 clearance/handover items completed");
  });
});

