import { describe, expect, it } from "vitest";
import { dashboardOverviewV4Fixture } from "./fixtures/dashboardOverview.v4.fixture";
import { toDashboardOverview } from "./dashboardMetrics";

describe("dashboard overview v4 wire contract", () => {
  it("normalizes the synthetic Result envelope and preserves workforce and attendance contracts", () => {
    // Round-trip through JSON to exercise the same camel-cased shape the API sends.
    const wireResponse = JSON.parse(JSON.stringify(dashboardOverviewV4Fixture));
    const overview = toDashboardOverview(wireResponse);

    expect(overview).toMatchObject({
      definitionVersion: "dashboard-overview.v4",
      asOfDate: "2026-11-17",
      timeZone: "Asia/Kolkata",
      generatedAtUtc: "2026-11-17T08:00:00Z",
      sourceAvailability: {
        employees: true,
        attendance: true,
        leaveManagement: true,
        jobs: true,
        offboarding: true,
      },
      totalEmployees: 6,
      attendanceBreakdown: {
        definitionVersion: "attendance-breakdown.v1",
        expectedEmployees: 6,
        presentOnly: 3,
        leaveOnly: 1,
        presentAndOnLeave: 1,
        explicitlyAbsent: 1,
        otherStatus: 0,
        unreported: 0,
      },
      headcountTrend: [
        { month: "2025-12", count: 4 },
        { month: "2026-01", count: 4 },
        { month: "2026-02", count: 4 },
        { month: "2026-03", count: 5 },
        { month: "2026-04", count: 5 },
        { month: "2026-05", count: 5 },
        { month: "2026-06", count: 5 },
        { month: "2026-07", count: 5 },
        { month: "2026-08", count: 6 },
        { month: "2026-09", count: 6 },
        { month: "2026-10", count: 6 },
        { month: "2026-11", count: 6 },
      ],
      leaveRequestCohortTrend: [
        { month: "2026-10", totalRequests: 4, pending: 1, approved: 2, rejected: 1, withdrawn: 0, otherStatus: 0 },
        { month: "2026-11", totalRequests: 3, pending: 1, approved: 1, rejected: 0, withdrawn: 1, otherStatus: 0 },
      ],
      workforceMovementTrend: [
        { month: "2026-10", hires: 2, exits: 1, netChange: 1 },
        { month: "2026-11", hires: 1, exits: 0, netChange: 1 },
      ],
      recentActivities: [{ type: "joined", employeeName: "Synthetic Employee" }],
    });

    const breakdown = overview?.attendanceBreakdown;
    expect(breakdown).not.toBeNull();
    expect(
      breakdown!.presentOnly + breakdown!.leaveOnly + breakdown!.presentAndOnLeave +
        breakdown!.explicitlyAbsent + breakdown!.otherStatus + breakdown!.unreported,
    ).toBe(breakdown!.expectedEmployees);
  });

  it("rejects a mismatched attendance denominator in an otherwise valid v4 response", () => {
    const malformed = JSON.parse(JSON.stringify(dashboardOverviewV4Fixture));
    malformed.methodResult.attendanceBreakdown.expectedEmployees = 7;

    expect(toDashboardOverview(malformed)?.attendanceBreakdown).toBeNull();
  });
});
