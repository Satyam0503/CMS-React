import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import dayjs from "dayjs";
import { UpcomingHolidayCard } from "./UpcomingHolidayCard";
import CalendarDays from "./CalendarDays";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("../../recruitment/services", () => ({
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

describe("UpcomingHolidayCard interview dossier integration", () => {
  let container: HTMLDivElement;
  let root: Root;

  const store = configureStore({
    reducer: {
      user: () => ({
        userData: {
          userId: "emp-1",
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

  it("opens InterviewDossierModal when clicking on an interview calendar item", async () => {
    const handleRefresh = vi.fn();
    const occasion = {
      id: "int-1",
      name: "Interview: Neha Singh - Technical Round 1",
      description: "Candidate: Neha Singh | Role: QA Engineer | Round 1 (Technical) | ApplicantId: app-101 | VacancyId: vac-202 | InterviewId: int-1",
      date: "2026-10-30T00:00:00.000Z",
      type: 2 as const,
      recurring: false,
      imageUrl: null,
    };

    await act(async () => {
      root.render(
        <Provider store={store}>
          <BrowserRouter>
            <IntlProvider locale="en" messages={{}}>
              <UpcomingHolidayCard
                key="test-key"
                occasion={occasion}
                occasions={[occasion]}
                handleRefresh={handleRefresh}
              />
            </IntlProvider>
          </BrowserRouter>
        </Provider>
      );
    });

    expect(container.textContent).toContain("Interview: Neha Singh");
    expect(container.textContent).toContain("Click to open Interview Dossier");

    // Click on the card item
    const clickableBox = container.querySelector(".text-truncate")?.closest(".d-flex");
    expect(clickableBox).toBeTruthy();

    await act(async () => {
      clickableBox?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Check that the dialog modal is now opened in the DOM
    const dialog = document.querySelector("[role='dialog']");
    expect(dialog).toBeTruthy();
    expect(dialog?.textContent).toContain("Neha Singh");
    expect(dialog?.textContent).toContain("Candidate Dossier & Meeting");
  });

  it("opens InterviewDossierModal when clicking on an interview in CalendarDays grid", async () => {
    const handleRefresh = vi.fn();
    const handleDateChange = vi.fn();
    const occasion = {
      id: "int-1",
      name: "Interview: Neha Singh - Technical Round 1",
      description: "Candidate: Neha Singh | Role: QA Engineer | Round 1 (Technical) | ApplicantId: app-101 | VacancyId: vac-202 | InterviewId: int-1",
      date: "2026-10-30T00:00:00.000Z",
      type: 2 as const,
      recurring: false,
      imageUrl: null,
    };

    await act(async () => {
      root.render(
        <Provider store={store}>
          <BrowserRouter>
            <IntlProvider locale="en" messages={{}}>
              <CalendarDays
                selectedDate={dayjs("2026-10-30")}
                handleSelectedDateChange={handleDateChange}
                occasions={[occasion]}
                handleRefresh={handleRefresh}
              />
            </IntlProvider>
          </BrowserRouter>
        </Provider>
      );
    });

    const interviewChip = container.querySelector(".calendar-day-holiday");
    expect(interviewChip).toBeTruthy();

    await act(async () => {
      interviewChip?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const dialog = document.querySelector("[role='dialog']");
    expect(dialog).toBeTruthy();
    expect(dialog?.textContent).toContain("Neha Singh");
    expect(dialog?.textContent).toContain("Candidate Dossier & Meeting");
  });
});
