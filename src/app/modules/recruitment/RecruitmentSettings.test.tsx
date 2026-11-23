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

    await vi.waitFor(() => expect(container.querySelector("#recruitment-tab-0")).not.toBeNull());

    expect(container.textContent).toContain("Recruitment Settings");
    expect(container.textContent).toContain("Company override active");
    expect(container.textContent).toContain("Interview feedback deadlines");
    expect(container.textContent).toContain("Interviewer scorecard reminder emails");
    expect(container.textContent).toContain("Track interview rounds with overdue interviewer scorecards.");

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

    expect(tab0?.textContent).toContain("Operating model");
    expect(tab1?.textContent).toContain("Stage gates");
    expect(tab2?.textContent).toContain("Screening & preboarding");
    expect(tab3?.textContent).toContain("Interview Plans & SLAs");
    expect(tab4?.textContent).toContain("Offers & email");
  });

  it("applies complete mode presets so switching from Enterprise to Simple clears enterprise-only capabilities", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    await act(async () => {
      root.render(<RecruitmentSettings />);
    });
    await vi.waitFor(() => expect(container.querySelector('button[aria-label*="Enterprise"]')).not.toBeNull());

    const enterpriseCard = container.querySelector('button[aria-label*="Enterprise"]') as HTMLButtonElement;
    const saveButton = () => Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes("Save settings"));

    expect(enterpriseCard).not.toBeNull();
    await act(async () => enterpriseCard.click());
    await act(async () => saveButton()?.click());
    const enterprisePayload = mockUpsertConfig.mock.calls[0][0];
    expect(enterprisePayload).toMatchObject({
      candidateSourceOptions: ["Career site", "Employee referral", "Job board", "Social media", "Search engine", "Recruitment agency", "Event", "Other", "Prefer not to say"],
      enableSla: true,
      enableAutomation: true,
      requisitions: true,
      slaTracking: true,
      automation: true,
      internalMobility: true,
      rehireLinks: true,
      parallelPanels: true,
      offerNegotiation: true,
    });

    const simpleCard = container.querySelector('button[aria-label*="Simple"]') as HTMLButtonElement;
    expect(simpleCard).not.toBeNull();
    await act(async () => simpleCard.click());
    await act(async () => saveButton()?.click());
    const simplePayload = mockUpsertConfig.mock.calls[1][0];
    expect(simplePayload).toMatchObject({
      candidateSourceOptions: ["Career site", "Employee referral", "Job board", "Social media", "Search engine", "Recruitment agency", "Event", "Other", "Prefer not to say"],
      enableSla: false,
      enableAutomation: false,
      requisitions: false,
      slaTracking: false,
      automation: false,
      internalMobility: false,
      rehireLinks: false,
      parallelPanels: false,
      offerNegotiation: false,
    });
  });

  it("reuses the same config idempotency key after a failed response for an unchanged save", async () => {
    mockUpsertConfig.mockRejectedValueOnce(new Error("The response was lost."));
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    await act(async () => root.render(<RecruitmentSettings />));
    await vi.waitFor(() => expect(container.querySelector('button[aria-label*="Enterprise"]')).not.toBeNull());

    const enterpriseCard = container.querySelector('button[aria-label*="Enterprise"]') as HTMLButtonElement;
    const saveButton = () => Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes("Save settings"));
    await act(async () => enterpriseCard.click());
    await act(async () => saveButton()?.click());
    const firstKey = mockUpsertConfig.mock.calls[0][0].idempotencyKey;

    await act(async () => saveButton()?.click());
    const retryKey = mockUpsertConfig.mock.calls[1][0].idempotencyKey;

    expect(firstKey).toBeTruthy();
    expect(retryKey).toBe(firstKey);
  });

  it("keeps the SLA and automation controls synchronized so either setting activates the same server capability", async () => {
    mockGetConfig.mockResolvedValueOnce({
      data: {
        success: true,
        methodResult: {
          locations: ["Remote"],
          recruitmentMode: "Standard",
          enableSla: false,
          slaTracking: false,
          enableAutomation: false,
          automation: false,
          candidateSourceOptions: ["Career site"],
          screeningCriteria: ["Relevant experience"],
          preboardingChecklist: ["candidate-details"],
        },
      },
    });
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    await act(async () => root.render(<RecruitmentSettings />));
    await vi.waitFor(() => expect(container.textContent).toContain("Interview feedback deadlines"));

    const toggleForCard = (title: string) => {
      const titleElement = Array.from(container.querySelectorAll("p")).find((element) => element.textContent?.trim() === title);
      return titleElement?.parentElement?.parentElement?.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
    };
    const slaToggle = toggleForCard("Interview feedback deadlines");
    if (!slaToggle) throw new Error("SLA card toggle was not rendered.");
    expect(slaToggle.checked).toBe(false);
    await act(async () => slaToggle.click());
    expect(slaToggle.checked).toBe(true);
    const automationToggle = toggleForCard("Interviewer scorecard reminder emails");
    if (!automationToggle) throw new Error("Automation card toggle was not rendered.");
    expect(automationToggle.checked).toBe(false);
    await act(async () => automationToggle.click());
    expect(automationToggle.checked).toBe(true);

    const saveButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes("Save settings"));
    await act(async () => saveButton?.click());

    expect(mockUpsertConfig).toHaveBeenCalledWith(expect.objectContaining({
      enableSla: true,
      slaTracking: true,
      enableAutomation: true,
      automation: true,
    }));
  });

  it("switches to Stage Gates & Capabilities tab and shows Per-Job Customization banner", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    await act(async () => {
      root.render(<RecruitmentSettings />);
    });
    await vi.waitFor(() => expect(container.querySelector("#recruitment-tab-1")).not.toBeNull());

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
    await vi.waitFor(() => expect(container.querySelector("#recruitment-tab-2")).not.toBeNull());

    // Click Tab 2
    const tab2 = container.querySelector("#recruitment-tab-2") as HTMLElement;
    await act(async () => {
      tab2.click();
    });

    const panel2 = container.querySelector("#recruitment-tabpanel-2") as HTMLElement;
    expect(panel2).not.toBeNull();
    expect(panel2.hidden).toBe(false);
    expect(panel2.textContent).toContain("Screening and preboarding defaults");
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
    await vi.waitFor(() => expect(container.querySelector("#recruitment-tab-4")).not.toBeNull());

    // Click Tab 4
    const tab4 = container.querySelector("#recruitment-tab-4") as HTMLElement;
    await act(async () => {
      tab4.click();
    });

    const panel4 = container.querySelector("#recruitment-tabpanel-4") as HTMLElement;
    expect(panel4).not.toBeNull();
    expect(panel4.hidden).toBe(false);
    expect(panel4.textContent).toContain("Offer email subject");
    expect(panel4.textContent).toContain("Candidate email");
    expect(panel4.textContent).toContain("Live preview");
    expect(panel4.textContent).toContain("Visual Editor");
    expect(panel4.textContent).toContain("HTML Source");
    expect(panel4.textContent).toContain("[CandidateName]");
    expect(panel4.textContent).toContain("[JobTitle]");
    expect(panel4.textContent).toContain("Restore standard template");
  });
});
