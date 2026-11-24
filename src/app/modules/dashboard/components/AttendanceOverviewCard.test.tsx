import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AttendanceOverviewCard } from "./AttendanceOverviewCard";
import { DashboardOverview } from "../model";

vi.mock("@mui/icons-material", () => ({
  default: () => null,
  BeachAccessOutlined: () => <span data-testid="holiday-icon" />,
}));

vi.mock("@mui/x-charts/PieChart", () => ({
  PieChart: () => <div data-testid="donut" />,
}));

vi.mock("react-intl", () => ({
  useIntl: () => ({
    formatMessage: ({ id, defaultMessage }: { id: string; defaultMessage?: string }, values?: Record<string, unknown>) => {
      const message = defaultMessage ?? id;
      return values ? `${message} ${JSON.stringify(values)}` : message;
    },
  }),
}));

const base: DashboardOverview = {
  totalEmployees: 142,
  totalEmployeesChangePercent: null,
  presentToday: 128,
  onLeaveToday: 9,
  absentToday: 5,
  attendanceBreakdown: {
    expectedEmployees: 142,
    presentOnly: 128,
    leaveOnly: 9,
    presentAndOnLeave: 0,
    explicitlyAbsent: 5,
    otherStatus: 0,
    unreported: 0,
  },
  isWorkingDay: true,
  openPositions: 0,
  headcountTrend: [],
  recentActivities: [],
};

let root: Root | null = null;
const render = (overview: DashboardOverview, state: { loading?: boolean; error?: boolean } = {}) => {
  const container = document.createElement("div");
  root = createRoot(container);
  act(() => root!.render(<AttendanceOverviewCard overview={overview} loading={state.loading ?? false} error={state.error ?? false} />));
  return container;
};

describe("AttendanceOverviewCard", () => {
  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("shows the split and the present percentage on a working day", () => {
    const container = render(base);
    expect(container.querySelector("[data-testid='donut']")).not.toBeNull();
    expect(container.textContent).toContain("90.1%");
    expect(container.textContent).toContain("3.5%");
    expect(container.textContent).toContain("Present & on leave");
    expect(container.textContent).toContain("No attendance record");
    expect(container.querySelectorAll("ul > li")).toHaveLength(6);
  });

  it("shows the non-working-day message instead of an empty donut", () => {
    const container = render({ ...base, presentToday: 0, onLeaveToday: 0, absentToday: 0, isWorkingDay: false });
    expect(container.querySelector("[data-testid='donut']")).toBeNull();
    expect(container.textContent).toContain("DASHBOARD.ATTENDANCE.NON_WORKING_TITLE");
  });

  it("announces the attendance loading state and hides decorative skeletons", () => {
    const container = render(base, { loading: true });
    expect(container.querySelector('[role="status"]')?.textContent).toContain("Loading attendance summary");
    expect(container.querySelector('[role="status"]')?.getAttribute("aria-busy")).toBe("true");
    expect(container.querySelectorAll('[aria-hidden="true"]')).not.toHaveLength(0);
  });

  it("announces a failed attendance request as an alert", () => {
    const container = render(base, { error: true });
    expect(container.querySelector('[role="alert"]')?.textContent).toContain("DASHBOARD.LOAD_ERROR");
  });
});
