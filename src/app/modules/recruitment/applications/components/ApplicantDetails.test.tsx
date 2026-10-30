import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { ApplicantDetails } from "./ApplicantDetails";
import { Roles } from "../../../../../utils/enums";
import enMessages from "../../../../../../public/locales/en.json";
import { flattenMessages } from "../../../../../utils/common";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const { mockApplicantData } = vi.hoisted(() => ({
  mockApplicantData: {
    applicantId: "app-test-2026",
    vacancyId: "vac-qa-01",
    vacancyName: "QA Engineer",
    firstName: "Neha",
    lastName: "Singh",
    email: "neha12@yopmail.com",
    phone: "9876543210",
    experience: 12,
    status: 1,
    activityType: 4, // ApplicationStatus.Selected
    applyDate: "2026-10-30T12:50:00Z",
    resumeUrl: "https://example.com/test-resume.pdf",
    finalInterviewScore: 80,
    finalInterviewRating: 4.0,
    finalInterviewRecommendation: "Strong Hire",
    evaluatedRoundsCount: 2,
  },
}));

vi.mock("../../services", () => ({
  getApplicantById: vi.fn().mockResolvedValue({
    data: {
      success: true,
      statusCode: 200,
      methodResult: mockApplicantData,
    },
  }),
  getApplicantComments: vi.fn().mockResolvedValue({
    data: {
      success: true,
      statusCode: 200,
      totalRecords: 0,
      methodResults: [],
    },
  }),
  getRecruitmentOfferByApplicant: vi.fn().mockResolvedValue({
    data: {
      success: true,
      methodResult: {
        offerId: "off-99",
        status: "Sent",
        salary: 57000,
        currency: "INR",
      },
    },
  }),
  getFinalInterviewScore: vi.fn().mockResolvedValue({
    data: {
      success: true,
      methodResult: {
        finalInterviewScore: 80,
        finalInterviewRating: 4.0,
        finalInterviewRecommendation: "Strong Hire",
        evaluatedRoundsCount: 2,
        excludesHrRound: false,
      },
    },
  }),
  editApplicant: vi.fn().mockResolvedValue({
    data: { success: true },
  }),
  addComment: vi.fn().mockResolvedValue({
    data: { success: true },
  }),
  upsertRecruitmentApplicationStage: vi.fn().mockResolvedValue({
    data: { success: true },
  }),
}));

vi.mock("./RecruitmentLifecycleDrawer", () => ({
  RecruitmentLifecycleDrawer: () => <div data-testid="recruitment-lifecycle-drawer" />,
}));

vi.mock("../../../../shared/components/PdfViewer", () => ({
  PdfViewer: () => <div data-testid="pdf-viewer">PDF Preview Mode Active</div>,
}));

vi.mock("../../../../Context/PageDataProvider", () => ({
  usePageData: () => ({
    setPageTitle: vi.fn(),
  }),
}));

describe("ApplicantDetails Bento Profile & Responsive Layout", () => {
  let container: HTMLDivElement;
  let root: Root;

  const store = configureStore({
    reducer: {
      user: () => ({
        userData: {
          userId: "admin-user",
          fullName: "Admin Evaluator",
          roleType: Roles.Administrator,
          modulePermission: [],
        },
      }),
    },
  });

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

  const renderComponent = async () => {
    await act(async () => {
      root.render(
        <Provider store={store}>
          <IntlProvider locale="en" messages={flattenMessages(enMessages)}>
            <MemoryRouter initialEntries={["/recruitment/applicant/app-test-2026"]}>
              <Routes>
                <Route path="/recruitment/applicant/:applicantid" element={<ApplicantDetails />} />
              </Routes>
            </MemoryRouter>
          </IntlProvider>
        </Provider>
      );
      await Promise.resolve();
      await Promise.resolve();
    });
  };

  it("renders modern Hero profile header with initials, candidate identity, contact strip, and bento cards", async () => {
    await renderComponent();

    const bodyText = document.body.textContent ?? "";

    // Candidate Identity in Hero Card
    expect(bodyText).toContain("Neha Singh");
    expect(bodyText).toContain("QA Engineer");
    expect(bodyText).toContain("Selected");

    // Initials Avatar
    expect(bodyText).toContain("NS");

    // Benchmark in Hero chip
    expect(bodyText).toContain("80%");
    expect(bodyText).toContain("Strong Hire");

    // Contact Highlights Strip
    expect(bodyText).toContain("neha12@yopmail.com");
    expect(bodyText).toContain("9876543210");
    expect(bodyText).toContain("1.0 year");

    // Bento Card 1: Interview & Technical Benchmark
    expect(bodyText).toContain("Interview & Technical Benchmark");
    expect(bodyText).toContain("2 substantive technical rounds evaluated with panel consensus.");
    expect(bodyText).toContain("View Scorecards & Debrief");

    // Bento Card 2: Hiring Lifecycle & Offer Pipeline
    expect(bodyText).toContain("Hiring Lifecycle & Offer Pipeline");
    expect(bodyText).toContain("Offer Sent: INR 57,000");

    // Status switch active
    expect(bodyText).toContain("Active");

    // Quick actions exist
    expect(bodyText).toContain("Preview CV");
    expect(bodyText).toContain("Manage Stage");
  });

  it("toggles CV Preview mode when Preview CV button is clicked", async () => {
    await renderComponent();

    const cvButton = Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find(
      (b) => b.textContent?.includes("Preview CV")
    );
    expect(cvButton).toBeDefined();

    await act(async () => {
      cvButton?.click();
      await Promise.resolve();
    });

    // Button label toggled to Close CV
    expect(document.body.textContent).toContain("Close CV");
    expect(document.body.textContent).toContain("PDF Preview Mode Active");
  });
});
