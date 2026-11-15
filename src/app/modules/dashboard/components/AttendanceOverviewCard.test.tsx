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
    formatMessage: ({ id }: { id: string }, values?: Record<string, unknown>) => (values ? `${id} ${JSON.stringify(values)}` : id),
  }),
}));

const base: DashboardOverview = {
  totalEmployees: 142,
  totalEmployeesChangePercent: null,
  presentToday: 128,
  onLeaveToday: 9,
  absentToday: 5,
  isWorkingDay: true,
  openPositions: 0,
  headcountTrend: [],
  recentActivities: [],
};

let root: Root | null = null;
const render = (overview: DashboardOverview) => {
  const container = document.createElement("div");
  root = createRoot(container);
  act(() => root!.render(<AttendanceOverviewCard overview={overview} loading={false} error={false} />));
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
    expect(container.textContent).toContain("(3.5%)");
  });

  it("shows the non-working-day message instead of an empty donut", () => {
    const container = render({ ...base, presentToday: 0, onLeaveToday: 0, absentToday: 0, isWorkingDay: false });
    expect(container.querySelector("[data-testid='donut']")).toBeNull();
    expect(container.textContent).toContain("DASHBOARD.ATTENDANCE.NON_WORKING_TITLE");
  });
});
