import { describe, expect, it } from "vitest";
import { dashboardSourceVisibility } from "./dashboardSourceVisibility";

describe("dashboardSourceVisibility", () => {
  it("preserves the legacy dashboard when module metadata is absent", () => {
    expect(dashboardSourceVisibility()).toEqual({
      employees: true,
      attendanceKpi: true,
      leaveKpi: true,
      attendanceBreakdown: true,
      headcountTrend: true,
      workforceMovement: true,
      leaveRequestCohorts: true,
      openPositions: true,
    });
  });

  it("hides only metrics that depend on disabled source modules", () => {
    expect(dashboardSourceVisibility({
      employees: true,
      attendance: true,
      leaveManagement: false,
      jobs: false,
      offboarding: false,
    })).toEqual({
      employees: true,
      attendanceKpi: true,
      leaveKpi: false,
      attendanceBreakdown: false,
      headcountTrend: true,
      workforceMovement: false,
      leaveRequestCohorts: false,
      openPositions: false,
    });
  });

  it("hides employee-linked reports and counts when employee data is unavailable", () => {
    const visible = dashboardSourceVisibility({
      employees: false,
      attendance: true,
      leaveManagement: true,
      jobs: true,
      offboarding: true,
    });
    expect(visible.employees).toBe(false);
    expect(visible.attendanceKpi).toBe(false);
    expect(visible.leaveKpi).toBe(false);
    expect(visible.attendanceBreakdown).toBe(false);
    expect(visible.headcountTrend).toBe(false);
    expect(visible.workforceMovement).toBe(false);
    expect(visible.leaveRequestCohorts).toBe(true);
    expect(visible.openPositions).toBe(true);
  });
});
