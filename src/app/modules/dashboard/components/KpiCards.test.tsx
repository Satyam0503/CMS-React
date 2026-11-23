import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { KpiCards } from "./KpiCards";

vi.mock("@mui/icons-material", () => ({
  ArrowDownward: () => null,
  ArrowUpward: () => null,
  EventAvailableOutlined: () => null,
  FlightTakeoffOutlined: () => null,
  GroupsOutlined: () => null,
  WorkOutlineOutlined: () => null,
}));

vi.mock("react-intl", () => ({
  useIntl: () => ({ formatMessage: ({ id }: { id: string }) => id }),
}));

let root: Root | null = null;
const render = (props: { loading: boolean; error?: boolean }) => {
  const container = document.createElement("div");
  root = createRoot(container);
  act(() => root!.render(<KpiCards overview={undefined} loading={props.loading} error={props.error} showOpenPositions />));
  return container;
};

describe("KpiCards", () => {
  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("shows unavailable placeholders rather than zero metrics after an overview failure", () => {
    const container = render({ loading: false, error: true });
    const unavailable = [...container.querySelectorAll('[aria-label="DASHBOARD.UNAVAILABLE"]')];

    expect(unavailable).toHaveLength(4);
    expect(unavailable.map((element) => element.textContent)).toEqual(["—", "—", "—", "—"]);
    expect(container.textContent).not.toContain("0");
  });

  it("renders clickable links for KPI cards when inside a router", () => {
    const container = document.createElement("div");
    const testRoot = createRoot(container);
    act(() => {
      testRoot.render(
        <MemoryRouter>
          <KpiCards
            overview={{
              totalEmployees: 42,
              totalEmployeesChangePercent: 5,
              presentToday: 40,
              onLeaveToday: 2,
              absentToday: 0,
              isWorkingDay: true,
              openPositions: 3,
              headcountTrend: [],
              recentActivities: [],
            }}
            loading={false}
            showOpenPositions
          />
        </MemoryRouter>
      );
    });
    const links = container.querySelectorAll("a");
    expect(links.length).toBeGreaterThan(0);
    const hrefs = [...links].map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("/employees");
    expect(hrefs).toContain("/attendance");
    expect(hrefs).toContain("/leavemanagement");
    expect(hrefs).toContain("/recruitment/jobs");
    act(() => testRoot.unmount());
  });
});
