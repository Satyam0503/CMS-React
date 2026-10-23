import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RecruitmentSettings from "./RecruitmentSettings";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const mockGetConfig = vi.fn();
const mockUpsertConfig = vi.fn();
const mockSetPageTitle = vi.fn();

vi.mock("./services", () => ({
  getRecruitmentEnterpriseConfig: (...args: any[]) => mockGetConfig(...args),
  upsertRecruitmentEnterpriseConfig: (...args: any[]) => mockUpsertConfig(...args),
}));

vi.mock("../../Context/PageDataProvider", () => ({
  usePageData: () => ({
    setPageTitle: mockSetPageTitle,
  }),
}));

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("../theme/useIsDark", () => ({
  useIsDark: () => false,
}));

vi.mock("./RecruitmentInterviewPlanEditor", () => ({
  default: () => <div data-testid="interview-plan-editor">Interview Plan Editor Mock</div>,
}));

vi.mock("./RecruitmentFeedbackSlaCard", () => ({
  default: () => <div data-testid="feedback-sla-card">Feedback SLA Card Mock</div>,
}));

vi.mock("./RecruitmentOfferApprovalPolicyEditor", () => ({
  default: () => <div data-testid="offer-approval-policy-editor">Offer Approval Policy Editor Mock</div>,
}));

const roots: Root[] = [];

describe("RecruitmentSettings Component", () => {
  beforeEach(() => {
    mockGetConfig.mockResolvedValue({
      data: {
        success: true,
        methodResult: {
          locations: ["Bengaluru", "Remote"],
          recruitmentMode: "Standard",
          enableSla: true,
          enableAutomation: false,
          applicationReview: true,
          hiringManagerReview: true,
          interviewRounds: true,
          parallelPanels: false,
          scorecards: true,
          offerApproval: true,
          offerNegotiation: false,
          candidateEmailActions: true,
          requisitions: false,
          slaTracking: false,
          automation: false,
          internalMobility: false,
          rehireLinks: false,
          autoAdvanceOnScreening: true,
          requireInterviewBeforeDecision: true,
          requirePreboardingBeforeHandoff: true,
          allowMultiVacancyApplications: true,
          allowJobWorkflowCustomization: true,
          screeningCriteria: ["Relevant experience", "Technical aptitude"],
          screeningPassScore: 70,
          preboardingChecklist: ["candidate-details", "documents", "id-verification"],
          defaultTimezone: "Asia/Kolkata",
          configSource: "CompanyOverride",
          overriddenFields: ["recruitmentMode", "screeningPassScore"],
          compensationSchemeName: "Standard",
          compensationCurrency: "INR",
          compensationComponents: {},
          defaultCandidateRetentionDays: 730,
          offerLetterSubjectTemplate: "Official Offer for [JobTitle]",
          offerLetterBodyTemplate: "<p>Dear [CandidateName], welcome to the team!</p>",
        },
      },
    });

    mockUpsertConfig.mockResolvedValue({
      data: {
        success: true,
        message: "Settings saved successfully",
      },
    });
  });

  afterEach(() => {
    while (roots.length > 0) {
      roots.pop()?.unmount();
    }
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("renders header, status chip, and all 5 navigation tabs", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    await act(async () => {
      root.render(<RecruitmentSettings />);
    });

    // Let any async load finish
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(container.textContent).toContain("Recruitment Settings");
    expect(container.textContent).toContain("Company override active");

    // Check all 5 tabs exist in DOM
    const tab0 = container.querySelector("#recruitment-tab-0");
    const tab1 = container.querySelector("#recruitment-tab-1");
    const tab2 = container.querySelector("#recruitment-tab-2");
    const tab3 = container.querySelector("#recruitment-tab-3");
    const tab4 = container.querySelector("#recruitment-tab-4");

    expect(tab0).not.toBeNull();
    expect(tab1).not.toBeNull();
    expect(tab2).not.toBeNull();
    expect(tab3).not.toBeNull();
    expect(tab4).not.toBeNull();

    expect(tab0?.textContent).toContain("Operating Model & Pipeline");
    expect(tab1?.textContent).toContain("Stage Gates & Capabilities");
    expect(tab2?.textContent).toContain("Screening & Preboarding");
    expect(tab3?.textContent).toContain("Interview Plans & SLAs");
    expect(tab4?.textContent).toContain("Offers & Email Templates");
  });

  it("switches to Stage Gates & Capabilities tab and shows Per-Job Customization banner", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    await act(async () => {
      root.render(<RecruitmentSettings />);
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // Click Tab 1
    const tab1 = container.querySelector("#recruitment-tab-1") as HTMLElement;
    expect(tab1).not.toBeNull();

    await act(async () => {
      tab1.click();
    });

    // Tabpanel 1 should be visible
    const panel1 = container.querySelector("#recruitment-tabpanel-1") as HTMLElement;
    expect(panel1).not.toBeNull();
    expect(panel1.hidden).toBe(false);
    expect(panel1.textContent).toContain("Per-Job Hiring Workflow & Screening Customization");
    expect(panel1.textContent).toContain("Stage & Gate Governance");
  });

  it("switches to Screening & Preboarding tab and displays criteria & checklist chips", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    await act(async () => {
      root.render(<RecruitmentSettings />);
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // Click Tab 2
    const tab2 = container.querySelector("#recruitment-tab-2") as HTMLElement;
    await act(async () => {
      tab2.click();
    });

    const panel2 = container.querySelector("#recruitment-tabpanel-2") as HTMLElement;
    expect(panel2).not.toBeNull();
    expect(panel2.hidden).toBe(false);
    expect(panel2.textContent).toContain("Screening & Preboarding Policy Configuration");
    expect(panel2.textContent).toContain("Minimum screening pass score (0–100%)");
  });

  it("switches to Offers & Email Templates tab and displays live preview", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    await act(async () => {
      root.render(<RecruitmentSettings />);
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // Click Tab 4
    const tab4 = container.querySelector("#recruitment-tab-4") as HTMLElement;
    await act(async () => {
      tab4.click();
    });

    const panel4 = container.querySelector("#recruitment-tabpanel-4") as HTMLElement;
    expect(panel4).not.toBeNull();
    expect(panel4.hidden).toBe(false);
    expect(panel4.textContent).toContain("Offer Letter Template & Candidate Preview");
    expect(panel4.textContent).toContain("Sample Candidate Email Preview");
    expect(panel4.textContent).toContain("Visual Editor");
    expect(panel4.textContent).toContain("HTML Source");
    expect(panel4.textContent).toContain("[CandidateName]");
    expect(panel4.textContent).toContain("[JobTitle]");
    expect(panel4.textContent).toContain("Restore standard template");
  });
});
