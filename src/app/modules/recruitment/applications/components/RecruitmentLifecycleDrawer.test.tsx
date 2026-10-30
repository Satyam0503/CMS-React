import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { RecruitmentLifecycleDrawer } from "./RecruitmentLifecycleDrawer";
import { Applicant } from "../../models";
import { ApplicationStatus } from "../../../../../utils/enums";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("../../services", async (importOriginal) => {
  const actual = await importOriginal<Record<string, any>>();
  return {
    ...actual,
    getRecruitmentInterviews: vi.fn().mockResolvedValue({
      data: {
        success: true,
        methodResult: [
          {
            interviewId: "int-1",
            roundNumber: 1,
            roundType: "Technical",
            title: "Technical Interview",
            panelistUserIds: ["emp-evaluator-1"],
          },
        ],
      },
    }),
    getRecruitmentInterviewRounds: vi.fn().mockResolvedValue({
      data: {
        success: true,
        methodResult: [
          {
            interviewId: "int-1",
            roundNumber: 1,
            roundType: "Technical",
            title: "Technical Interview",
            panelistUserIds: ["emp-evaluator-1"],
          },
        ],
      },
    }),
    getRecruitmentScorecards: vi.fn().mockResolvedValue({
      data: { success: true, methodResult: [] },
    }),
    getFinalInterviewScore: vi.fn().mockResolvedValue({
      data: { success: true, methodResult: null },
    }),
    getRecruitmentInterviewPlan: vi.fn().mockResolvedValue({
      data: {
        success: true,
        methodResult: {
          planId: "plan-1",
          ratingScale: { scaleType: "Numeric1To5", minRating: 1, maxRating: 5 },
          competencies: [
            { code: "CORE", name: "Role Specific Technical Skills", weight: 50, isMandatory: true, minScore: 60 },
            { code: "COMM", name: "Communication & Articulation", weight: 50, isMandatory: false, minScore: 50 },
          ],
        },
      },
    }),
    getRecruitmentOfferByApplicant: vi.fn().mockResolvedValue({
      data: { success: true, methodResult: null },
    }),
    getRecruitmentPreboarding: vi.fn().mockResolvedValue({
      data: { success: true, methodResult: null },
    }),
    getRecruitmentWorkflowTemplate: vi.fn().mockResolvedValue({
      data: { success: true, methodResult: null },
    }),
    getRecruitmentPreboardingQueue: vi.fn().mockResolvedValue({
      data: { success: true, methodResult: [] },
    }),
    getRecruitmentOnboardingQueue: vi.fn().mockResolvedValue({
      data: { success: true, methodResult: [] },
    }),
    upsertRecruitmentScorecard: vi.fn().mockResolvedValue({
      data: { success: true, methodResult: "sc-101" },
    }),
  };
});

vi.mock("../../../../../services/EmployeeServices", () => ({
  getAllEmployeeDetails: vi.fn().mockResolvedValue({
    data: {
      success: true,
      data: [
        { userId: "emp-evaluator-1", fullName: "Lead Evaluator", email: "eval@codeji.com" },
      ],
    },
  }),
}));

vi.mock("../../../../../services/CandidateServices", () => ({
  getCandidateTimeline: vi.fn().mockResolvedValue({
    data: { success: true, data: [] },
  }),
}));

describe("RecruitmentLifecycleDrawer Evaluation Criteria deletion & management", () => {
  let container: HTMLDivElement;
  let root: Root;

  const store = configureStore({
    reducer: {
      user: () => ({
        userData: {
          userId: "emp-evaluator-1",
          fullName: "Lead Evaluator",
          modulePermission: [],
        },
      }),
    },
  });

  const mockApplicant = {
    applicantId: "app-test-99",
    vacancyId: "vac-test-1",
    vacancyName: "QA Engineer",
    firstName: "Neha",
    lastName: "Singh",
    state: "Active",
    email: "neha@test.com",
    phone: "+91 9876543210",
    experience: 3,
    status: 1,
    activityType: ApplicationStatus.Shortlisted,
    applyDate: "2026-10-30",
    resumeUrl: null,
  } as unknown as Applicant;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("deletes the exact clicked evaluation criterion without affecting adjacent criteria", async () => {
    await act(async () => {
      root.render(
        <Provider store={store}>
          <IntlProvider locale="en" messages={{}}>
            <BrowserRouter>
              <RecruitmentLifecycleDrawer
                open={true}
                applicant={mockApplicant}
                onClose={vi.fn()}
                onSaved={vi.fn()}
              />
            </BrowserRouter>
          </IntlProvider>
        </Provider>
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    // Switch to Sub-tab 1: "2. Scorecard & Hiring Decision"
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("button"));
    const scorecardTab = buttons.find((b) => b.textContent?.includes("2. Scorecard & Hiring Decision"));
    expect(scorecardTab).toBeDefined();

    await act(async () => {
      scorecardTab?.click();
      await Promise.resolve();
    });

    // Locate criteria name inputs
    const getCriteriaInputs = () =>
      Array.from(document.querySelectorAll<HTMLInputElement>('input')).filter((input) => {
        const val = input.value;
        return [
          "Technical Competence",
          "Problem Solving & Analytical Ability",
          "Communication & Collaboration",
          "Culture Add & Values Alignment",
        ].includes(val);
      });

    let inputs = getCriteriaInputs();
    expect(inputs.length).toBe(4);
    expect(inputs.map((i) => i.value)).toEqual([
      "Technical Competence",
      "Problem Solving & Analytical Ability",
      "Communication & Collaboration",
      "Culture Add & Values Alignment",
    ]);

    // Find delete buttons with aria-label
    let deleteButtons = document.querySelectorAll<HTMLButtonElement>('button[aria-label^="Delete"]');
    expect(deleteButtons.length).toBe(4);

    // Delete criterion at index 1 ("Problem Solving & Analytical Ability")
    await act(async () => {
      deleteButtons[1].click();
    });

    // Verify specifically criterion 1 is deleted and 0, 2, 3 remain intact
    inputs = getCriteriaInputs();
    expect(inputs.length).toBe(3);
    expect(inputs.map((i) => i.value)).toEqual([
      "Technical Competence",
      "Communication & Collaboration",
      "Culture Add & Values Alignment",
    ]);

    // Delete criterion at index 1 ("Communication & Collaboration")
    deleteButtons = document.querySelectorAll<HTMLButtonElement>('button[aria-label^="Delete"]');
    expect(deleteButtons.length).toBe(3);

    await act(async () => {
      deleteButtons[1].click();
    });

    inputs = getCriteriaInputs();
    expect(inputs.length).toBe(2);
    expect(inputs.map((i) => i.value)).toEqual([
      "Technical Competence",
      "Culture Add & Values Alignment",
    ]);

    // Delete the remaining 2 criteria to test deletion down to 0
    deleteButtons = document.querySelectorAll<HTMLButtonElement>('button[aria-label^="Delete"]');
    await act(async () => {
      deleteButtons[0].click();
    });

    deleteButtons = document.querySelectorAll<HTMLButtonElement>('button[aria-label^="Delete"]');
    expect(deleteButtons.length).toBe(1);

    await act(async () => {
      deleteButtons[0].click();
    });

    // Verify empty state is displayed and allows adding a new criterion
    expect(document.body.textContent).toContain("No evaluation criteria configured");
  });

  it("renders scheduled interview rounds list and opens schedule next round form", async () => {
    await act(async () => {
      root.render(
        <Provider store={store}>
          <IntlProvider locale="en" messages={{}}>
            <BrowserRouter>
              <RecruitmentLifecycleDrawer
                open={true}
                applicant={mockApplicant}
                onClose={vi.fn()}
                onSaved={vi.fn()}
              />
            </BrowserRouter>
          </IntlProvider>
        </Provider>
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    // Sub-tab 0 is active by default
    expect(document.body.textContent).toContain("Scheduled Interview Stages (1)");
    expect(document.body.textContent).toContain("Round 1: Technical");
    expect(document.body.textContent).toContain("Technical Interview");

    // Action buttons for scheduled round exist
    const editRoundBtn = Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find(
      (b) => b.textContent?.includes("Edit Round")
    );
    expect(editRoundBtn).toBeDefined();

    const evaluateRoundBtn = Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find(
      (b) => b.textContent?.includes("Evaluate Round")
    );
    expect(evaluateRoundBtn).toBeDefined();

    // Schedule next round button (Schedule Round 2)
    const scheduleNextBtn = Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find(
      (b) => b.textContent?.includes("Schedule Round 2")
    );
    expect(scheduleNextBtn).toBeDefined();

    // Click "Schedule Round 2"
    await act(async () => {
      scheduleNextBtn?.click();
    });

    // Form to schedule round 2 is opened
    expect(document.body.textContent).toContain("Schedule Interview Round 2");
  });

  it("prevents duplicate scoring by displaying recorded scorecard confirmation when already submitted", async () => {
    const { getRecruitmentScorecards } = await import("../../services");
    vi.mocked(getRecruitmentScorecards).mockResolvedValueOnce({
      data: {
        success: true,
        methodResult: [
          {
            scorecardId: "sc-drawer-1",
            applicantId: "app-test-99",
            vacancyId: "vac-test-1",
            roundNumber: 1,
            reviewerUserId: "emp-evaluator-1",
            recommendation: "Strong Hire",
            status: "Submitted",
            notes: "Clear and deep technical expertise demonstrated.",
            criteria: [
              { id: "c1", name: "Technical Competence", rating: 5, notes: "Flawless" },
            ],
          },
        ],
      },
    } as any);

    await act(async () => {
      root.render(
        <Provider store={store}>
          <IntlProvider locale="en" messages={{}}>
            <BrowserRouter>
              <RecruitmentLifecycleDrawer
                open={true}
                applicant={mockApplicant}
                onClose={vi.fn()}
                onSaved={vi.fn()}
              />
            </BrowserRouter>
          </IntlProvider>
        </Provider>
      );
    });

    // Switch to Sub-tab 1: Scorecard & Hiring Decision
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("button"));
    const scorecardTab = buttons.find((b) => b.textContent?.includes("2. Scorecard & Hiring Decision"));
    expect(scorecardTab).toBeDefined();

    await act(async () => {
      scorecardTab?.click();
    });

    // Recorded scorecard confirmation should be visible
    expect(document.body.textContent).toContain("Scorecard Recorded for Round 1");
    expect(document.body.textContent).toContain("Clear and deep technical expertise demonstrated.");

    // Empty form with "Record Panelist Scorecard" should NOT be shown
    expect(document.body.textContent).not.toContain("Record Panelist Scorecard for Round 1");

    // Click "Edit / Revise Scorecard" to unlock editing
    const editScorecardBtn = Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find(
      (b) => b.textContent?.includes("Edit / Revise Scorecard")
    );
    expect(editScorecardBtn).toBeDefined();

    await act(async () => {
      editScorecardBtn?.click();
    });

    // Now edit mode is unlocked
    expect(document.body.textContent).toContain("Update Scorecard for Round 1");
  });

  it("supports dynamic compensation component additions, company presets, deletion, and real-time CTC calculation", async () => {
    const selectedApplicant = {
      ...mockApplicant,
      applicantId: "app-selected-1",
      activityType: ApplicationStatus.Selected,
    } as unknown as Applicant;

    await act(async () => {
      root.render(
        <Provider store={store}>
          <IntlProvider locale="en" messages={{}}>
            <BrowserRouter>
              <RecruitmentLifecycleDrawer
                open={true}
                applicant={selectedApplicant}
                onClose={vi.fn()}
                onSaved={vi.fn()}
              />
            </BrowserRouter>
          </IntlProvider>
        </Provider>
      );
    });

    // Offer step is active
    expect(document.body.textContent).toContain("Create New Employment Offer");
    expect(document.body.textContent).toContain("Allowances & Compensation Components (Optional)");
    expect(document.body.textContent).toContain("TOTAL ANNUAL CTC");

    // Standard company presets are rendered (added presets show checkmark badge)
    expect(document.body.textContent).toContain("HRA");
    expect(document.body.textContent).toContain("+ SPECIAL");
    expect(document.body.textContent).toContain("+ LTA");
    expect(document.body.textContent).toContain("+ MEDICAL");

    // Initial default 3 components exist (HRA: 5000, Transport: 10000, Bonus: 12000 => 27000 total allowances)
    // Find the base salary input and enter 30000
    const inputs = Array.from(document.querySelectorAll<HTMLInputElement>("input"));
    const salaryInput = inputs.find((i) => i.placeholder?.includes("950000"));
    expect(salaryInput).toBeDefined();

    await act(async () => {
      if (salaryInput) {
        // Set base salary to 30000
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        nativeSetter?.call(salaryInput, "30000");
        salaryInput.dispatchEvent(new Event("input", { bubbles: true }));
        salaryInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });

    // 30000 base + 27000 allowances = INR 57,000 CTC
    expect(document.body.textContent).toContain("57,000");

    // Click "Add Component / Allowance" button
    const addComponentBtn = Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find(
      (b) => b.textContent?.includes("Add Component / Allowance")
    );
    expect(addComponentBtn).toBeDefined();

    await act(async () => {
      addComponentBtn?.click();
    });

    // Now 4 components exist
    const deleteButtons = document.querySelectorAll<HTMLButtonElement>('button[aria-label^="Delete"]');
    expect(deleteButtons.length).toBe(4);

    // Delete the last component
    await act(async () => {
      deleteButtons[3].click();
    });

    // Back to 3 components and CTC remains consistent
    const deleteButtonsAfter = document.querySelectorAll<HTMLButtonElement>('button[aria-label^="Delete"]');
    expect(deleteButtonsAfter.length).toBe(3);
    expect(document.body.textContent).toContain("57,000");
  });
});
