import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import dayjs from "dayjs";
import { UpcomingBirthdays } from "./UpcomingBirthdays";
import { UpcomingAnniversaries } from "./UpcomingAnniversaries";
import { UpComingCelebration } from "./UpcomingCelebration";
import { CelebrationModule } from "../model";

vi.mock("@mui/icons-material", () => ({
  CakeOutlined: () => <span data-testid="cake-icon" />,
  WorkspacePremiumOutlined: () => <span data-testid="premium-icon" />,
}));

vi.mock("react-intl", () => ({
  useIntl: () => ({
    formatMessage: ({ id, defaultMessage }: { id: string; defaultMessage?: string }) =>
      defaultMessage || id,
  }),
}));

const mockCelebrations = {
  birthday: [
    {
      employeeId: "emp-1",
      employeeName: "hari om",
      profileUrl: null,
      jobRole: { en: "Developer" },
      date: dayjs("2026-12-31"),
      ordinal: 22,
    },
    {
      employeeId: "emp-2",
      employeeName: "Satyam Dubey",
      profileUrl: null,
      jobRole: { en: "Designer" },
      date: dayjs("2027-07-10"),
      ordinal: 19,
    },
  ] as CelebrationModule[],
  workAnniversary: [
    {
      employeeId: "emp-3",
      employeeName: "John Doe",
      profileUrl: null,
      jobRole: { en: "Manager" },
      date: dayjs("2027-01-15"),
      ordinal: 5,
    },
  ] as CelebrationModule[],
};

vi.mock("../dashboardQueries", () => ({
  useUpcomingCelebrationsQuery: () => ({
    data: {
      success: true,
      methodResult: mockCelebrations,
    },
    isPending: false,
  }),
}));

describe("Upcoming Celebration Cards", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  afterEach(() => {
    if (root) {
      act(() => root?.unmount());
      root = null;
    }
    if (container) {
      container.remove();
      container = null;
    }
    vi.clearAllMocks();
  });

  const renderComponent = async (element: React.ReactElement) => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root?.render(element);
    });
    return container;
  };

  it("renders UpcomingBirthdays as a separate card with employee details", async () => {
    const dom = await renderComponent(
      <UpcomingBirthdays birthdays={mockCelebrations.birthday} />
    );

    expect(dom.textContent).toContain("Upcoming Birthdays");
    expect(dom.textContent).toContain("2"); // count badge
    expect(dom.textContent).toContain("hari om");
    expect(dom.textContent).toContain("22nd Birthday");
    expect(dom.textContent).toContain("Satyam Dubey");
    expect(dom.textContent).toContain("19th Birthday");
  });

  it("renders UpcomingBirthdays empty state when there are no birthdays", async () => {
    const dom = await renderComponent(<UpcomingBirthdays birthdays={[]} />);

    expect(dom.textContent).toContain("Upcoming Birthdays");
    expect(dom.textContent).toContain("0"); // count badge
    expect(dom.textContent).toContain("No upcoming birthdays right now");
  });

  it("renders UpcomingAnniversaries as a separate card with employee details", async () => {
    const dom = await renderComponent(
      <UpcomingAnniversaries anniversaries={mockCelebrations.workAnniversary} />
    );

    expect(dom.textContent).toContain("Upcoming Work Anniversaries");
    expect(dom.textContent).toContain("1"); // count badge
    expect(dom.textContent).toContain("John Doe");
    expect(dom.textContent).toContain("5th Work Anniversary");
  });

  it("renders UpcomingAnniversaries empty state when there are no anniversaries", async () => {
    const dom = await renderComponent(<UpcomingAnniversaries anniversaries={[]} />);

    expect(dom.textContent).toContain("Upcoming Work Anniversaries");
    expect(dom.textContent).toContain("0"); // count badge
    expect(dom.textContent).toContain("No upcoming work anniversaries right now");
  });

  it("renders both birthday and anniversary cards together in UpComingCelebration with responsive layout", async () => {
    const dom = await renderComponent(<UpComingCelebration />);

    expect(dom.textContent).toContain("Upcoming Birthdays");
    expect(dom.textContent).toContain("hari om");
    expect(dom.textContent).toContain("Upcoming Work Anniversaries");
    expect(dom.textContent).toContain("John Doe");

    // Check that two separate MuiCard components are rendered
    const cards = dom.querySelectorAll(".MuiCard-root");
    expect(cards.length).toBe(2);
  });
});

