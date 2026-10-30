import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { InterviewDossierModal } from "./InterviewDossierModal";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("../../services", () => ({
  getApplicantById: vi.fn().mockResolvedValue({
    data: {
      success: true,
      methodResult: {
        applicantId: "app-101",
        firstName: "Neha",
        lastName: "Singh",
        email: "neha@test.com",
        phone: "+91 9876543210",
        vacancyName: "QA Engineer",
        vacancyId: "vac-qa-1",
        experience: "3",
      },
    },
  }),
  getRecruitmentScorecards: vi.fn().mockResolvedValue({
    data: { success: true, methodResult: [] },
  }),
  upsertRecruitmentScorecard: vi.fn().mockResolvedValue({
    data: { success: true, methodResult: "sc-1" },
  }),
}));

describe("InterviewDossierModal criteria management & deletion", () => {
  let container: HTMLDivElement;
  let root: Root;

  const store = configureStore({
    reducer: {
      user: () => ({
        userData: {
          userId: "emp-evaluator-1",
          modulePermission: [],
        },
      }),
    },
  });

  const occasion = {
    id: "occ-1",
    name: "Interview: Neha Singh - Technical Interview",
    description: "ApplicantId: app-101 | VacancyId: vac-qa-1 | Round: 1 | MeetingUrl: https://meet.google.com/test",
    date: "2026-10-30",
  };

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

  it("renders scorecard criteria and deletes specific criterion reliably", async () => {
    await act(async () => {
      root.render(
        <Provider store={store}>
          <BrowserRouter>
            <InterviewDossierModal open={true} onClose={vi.fn()} occasion={occasion} />
          </BrowserRouter>
        </Provider>
      );
    });

    // Switch to Scorecard Evaluation tab (tab 1)
    const tabs = document.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    expect(tabs.length).toBeGreaterThan(1);
    await act(async () => {
      tabs[1].click();
    });

    // Check initial criteria input values
    const getCriteriaInputs = () =>
      Array.from(document.querySelectorAll<HTMLInputElement>('input[value]')).filter((input) => {
        const val = input.value;
        return [
          "Technical Competence",
          "Problem Solving & Architecture",
          "Communication & Articulation",
          "Cultural & Value Alignment",
        ].includes(val);
      });

    let inputs = getCriteriaInputs();
    expect(inputs.length).toBe(4);
    expect(inputs.map((i) => i.value)).toEqual([
      "Technical Competence",
      "Problem Solving & Architecture",
      "Communication & Articulation",
      "Cultural & Value Alignment",
    ]);

    // Find delete button for "Problem Solving & Architecture"
    const deleteButtons = document.querySelectorAll<HTMLButtonElement>('button[aria-label^="Delete"]');
    expect(deleteButtons.length).toBe(4);

    // Click delete on criterion index 1 ("Problem Solving & Architecture")
    await act(async () => {
      deleteButtons[1].click();
    });

    // Verify criterion 1 is gone, and the remaining 3 are exactly 0, 2, 3
    inputs = getCriteriaInputs();
    expect(inputs.length).toBe(3);
    expect(inputs.map((i) => i.value)).toEqual([
      "Technical Competence",
      "Communication & Articulation",
      "Cultural & Value Alignment",
    ]);

    // Add a new criterion
    const addBtn = Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find(
      (b) => b.textContent?.includes("Add Criterion")
    );
    expect(addBtn).toBeDefined();

    await act(async () => {
      addBtn?.click();
    });

    // Delete remaining criteria until 0
    let remainingDeleteBtns = document.querySelectorAll<HTMLButtonElement>('button[aria-label^="Delete"]');
    while (remainingDeleteBtns.length > 0) {
      await act(async () => {
        remainingDeleteBtns[0].click();
      });
      remainingDeleteBtns = document.querySelectorAll<HTMLButtonElement>('button[aria-label^="Delete"]');
    }

    // Verify empty state is displayed
    expect(document.body.textContent).toContain("No criteria configured");
  });

  it("displays recorded scorecard confirmation and prevents duplicate scoring prompt when already submitted", async () => {
    const { getRecruitmentScorecards } = await import("../../services");
    vi.mocked(getRecruitmentScorecards).mockResolvedValueOnce({
      data: {
        success: true,
        methodResult: [
          {
            scorecardId: "sc-recorded-1",
            applicantId: "app-101",
            vacancyId: "vac-qa-1",
            roundNumber: 1,
            reviewerUserId: "emp-evaluator-1",
            recommendation: "Strong Hire",
            status: "Submitted",
            notes: "Outstanding technical depth and clarity.",
            criteria: [
              { name: "Technical Competence", rating: 5, notes: "Excellent" },
              { name: "Problem Solving & Architecture", rating: 4, notes: "Solid" },
            ],
          },
        ],
      },
    } as any);

    await act(async () => {
      root.render(
        <Provider store={store}>
          <BrowserRouter>
            <InterviewDossierModal open={true} onClose={vi.fn()} occasion={occasion} />
          </BrowserRouter>
        </Provider>
      );
    });

    // Switch to Scorecard Evaluation tab (tab 1)
    const tabs = document.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    await act(async () => {
      tabs[1].click();
    });

    // Verify confirmation view is shown instead of blank evaluation form
    expect(document.body.textContent).toContain("Your Scorecard is Recorded for Round 1");
    expect(document.body.textContent).toContain("Outstanding technical depth and clarity.");
    expect(document.body.textContent).toContain("Strong Hire");

    // The submit button for new scorecard is NOT visible initially
    expect(document.body.textContent).not.toContain("Your Evaluation Scorecard (Round 1)");

    // Find and click "Edit My Scorecard" button
    const editBtn = Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find(
      (b) => b.textContent?.includes("Edit My Scorecard")
    );
    expect(editBtn).toBeDefined();

    await act(async () => {
      editBtn?.click();
    });

    // Now edit mode is unlocked
    expect(document.body.textContent).toContain("Update Your Evaluation Scorecard (Round 1)");
  });
});
