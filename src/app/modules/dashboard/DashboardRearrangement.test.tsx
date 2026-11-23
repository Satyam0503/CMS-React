import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { KpiCards } from "./components/KpiCards";

vi.mock("@mui/icons-material", () => ({
  ArrowDownward: () => null,
  ArrowUpward: () => null,
  EventAvailableOutlined: () => null,
  FlightTakeoffOutlined: () => null,
  GroupsOutlined: () => null,
  WorkOutlineOutlined: () => null,
}));

vi.mock("react-intl", () => ({
  useIntl: () => ({
    formatMessage: ({ id }: { id: string }) => id,
  }),
}));

let root: Root | null = null;

describe("Dashboard UI Rearrangement on Module Uninstall", () => {
  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("renders 2 equal columns when only 2 KPI cards are active (e.g. Attendance & Leave uninstalled)", () => {
    const container = document.createElement("div");
    root = createRoot(container);
    act(() => {
      root!.render(
        <MemoryRouter>
          <KpiCards
            overview={{
              totalEmployees: 60,
              totalEmployeesChangePercent: 11,
              presentToday: 60,
              onLeaveToday: 0,
              absentToday: 0,
              isWorkingDay: true,
              openPositions: 3,
              headcountTrend: [],
              recentActivities: [],
              sourceAvailability: {
                employees: true,
                attendance: false,
                leaveManagement: false,
                jobs: true,
                offboarding: true,
              },
            }}
            loading={false}
            showEmployees={true}
            showAttendance={false}
            showLeave={false}
            showOpenPositions={true}
          />
        </MemoryRouter>
      );
    });

    expect(container.textContent).toContain("DASHBOARD.KPI.TOTAL_EMPLOYEES");
    expect(container.textContent).toContain("DASHBOARD.KPI.OPEN_POSITIONS");
    expect(container.textContent).not.toContain("DASHBOARD.KPI.PRESENT_TODAY");
    expect(container.textContent).not.toContain("DASHBOARD.KPI.ON_LEAVE");

    const cards = container.querySelectorAll(".MuiCard-root");
    expect(cards).toHaveLength(2);
  });

  it("returns null when all KPI cards are uninstalled/disabled", () => {
    const container = document.createElement("div");
    root = createRoot(container);
    act(() => {
      root!.render(
        <MemoryRouter>
          <KpiCards
            overview={{
              totalEmployees: 60,
              totalEmployeesChangePercent: null,
              presentToday: 60,
              onLeaveToday: 0,
              absentToday: 0,
              isWorkingDay: true,
              openPositions: 3,
              headcountTrend: [],
              recentActivities: [],
              sourceAvailability: {
                employees: false,
                attendance: false,
                leaveManagement: false,
                jobs: false,
                offboarding: false,
              },
            }}
            loading={false}
            showEmployees={false}
            showAttendance={false}
            showLeave={false}
            showOpenPositions={false}
          />
        </MemoryRouter>
      );
    });

    expect(container.firstChild).toBeNull();
  });

  it("renders 1 card cleanly when only 1 KPI card is enabled", () => {
    const container = document.createElement("div");
    root = createRoot(container);
    act(() => {
      root!.render(
        <MemoryRouter>
          <KpiCards
            overview={{
              totalEmployees: 60,
              totalEmployeesChangePercent: null,
              presentToday: 60,
              onLeaveToday: 0,
              absentToday: 0,
              isWorkingDay: true,
              openPositions: 3,
              headcountTrend: [],
              recentActivities: [],
              sourceAvailability: {
                employees: true,
                attendance: false,
                leaveManagement: false,
                jobs: false,
                offboarding: false,
              },
            }}
            loading={false}
            showEmployees={true}
            showAttendance={false}
            showLeave={false}
            showOpenPositions={false}
          />
        </MemoryRouter>
      );
    });

    expect(container.textContent).toContain("DASHBOARD.KPI.TOTAL_EMPLOYEES");
    expect(container.textContent).not.toContain("DASHBOARD.KPI.OPEN_POSITIONS");
    const cards = container.querySelectorAll(".MuiCard-root");
    expect(cards).toHaveLength(1);
  });
});
