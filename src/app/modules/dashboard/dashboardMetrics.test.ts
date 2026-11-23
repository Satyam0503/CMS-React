import dayjs from "dayjs";
import { describe, expect, it } from "vitest";
import { attendanceBreakdown, departmentRows, greetingKey, mergeReminders, percentOf, toDashboardOverview } from "./dashboardMetrics";
import { DashboardOverview } from "./model";

const overview = (patch: Partial<DashboardOverview> = {}): DashboardOverview => ({
  totalEmployees: 142,
  totalEmployeesChangePercent: 6,
  presentToday: 128,
  onLeaveToday: 9,
  absentToday: 5,
  attendanceBreakdown: {
    definitionVersion: "attendance-breakdown.v1",
    expectedEmployees: 142,
    presentOnly: 128,
    leaveOnly: 9,
    presentAndOnLeave: 0,
    explicitlyAbsent: 5,
    otherStatus: 0,
    unreported: 0,
  },
  isWorkingDay: true,
  openPositions: 5,
  headcountTrend: [],
  recentActivities: [],
  ...patch,
});

describe("dashboard metrics", () => {
  it("rounds percentages to one decimal and guards an empty base", () => {
    expect(percentOf(128, 142)).toBe(90.1);
    expect(percentOf(9, 142)).toBe(6.3);
    expect(percentOf(3, 0)).toBe(0);
  });

  it("splits today's attendance into disjoint buckets against expected employees", () => {
    const { tracked, slices, presentPercent } = attendanceBreakdown(overview());
    expect(tracked).toBe(142);
    expect(presentPercent).toBe(90.1);
    expect(slices.map((s) => s.percent)).toEqual([90.1, 6.3, 0, 3.5, 0, 0]);
  });

  it("keeps approved half-day overlap visible without double-counting the chart denominator", () => {
    const { tracked, slices, presentPercent } = attendanceBreakdown(overview({
      attendanceBreakdown: {
        expectedEmployees: 4,
        presentOnly: 1,
        leaveOnly: 1,
        presentAndOnLeave: 1,
        explicitlyAbsent: 0,
        otherStatus: 0,
        unreported: 1,
      },
    }));
    expect(tracked).toBe(4);
    expect(slices.reduce((total, slice) => total + slice.count, 0)).toBe(tracked);
    expect(presentPercent).toBe(50);
  });

  it("reports nothing tracked on a day with no attendance", () => {
    const { tracked, presentPercent } = attendanceBreakdown(overview({ presentToday: 0, onLeaveToday: 0, absentToday: 0, isWorkingDay: false, attendanceBreakdown: { expectedEmployees: 0, presentOnly: 0, leaveOnly: 0, presentAndOnLeave: 0, explicitlyAbsent: 0, otherStatus: 0, unreported: 0 } }));
    expect(tracked).toBe(0);
    expect(presentPercent).toBe(0);
  });

  it("preserves definition and as-of metadata from the overview API", () => {
    const result = toDashboardOverview({
      success: true,
      methodResult: {
        definitionVersion: "dashboard-overview.v4",
        asOfDate: "2026-11-16",
        timeZone: "Asia/Kolkata",
        generatedAtUtc: "2026-11-16T05:00:00Z",
        attendanceBreakdown: { definitionVersion: "attendance-breakdown.v1", expectedEmployees: 2, presentOnly: 1, leaveOnly: 0, presentAndOnLeave: 0, explicitlyAbsent: 0, otherStatus: 0, unreported: 1 },
      },
    } as never);

    expect(result).toMatchObject({
      definitionVersion: "dashboard-overview.v4",
      asOfDate: "2026-11-16",
      timeZone: "Asia/Kolkata",
      generatedAtUtc: "2026-11-16T05:00:00Z",
      attendanceBreakdown: { definitionVersion: "attendance-breakdown.v1", expectedEmployees: 2, presentOnly: 1, leaveOnly: 0, presentAndOnLeave: 0, explicitlyAbsent: 0, otherStatus: 0, unreported: 1 },
    });
  });

  it("hides attendance composition when the server definition or total does not reconcile", () => {
    const mismatched = toDashboardOverview({
      success: true,
      methodResult: {
        attendanceBreakdown: { definitionVersion: "attendance-breakdown.v1", expectedEmployees: 4, presentOnly: 1, leaveOnly: 0, presentAndOnLeave: 0, explicitlyAbsent: 0, otherStatus: 0, unreported: 0 },
      },
    } as never);
    expect(mismatched?.attendanceBreakdown).toBeNull();
  });

  it("drops malformed headcount points before sorting the chart series", () => {
    const result = toDashboardOverview({
      success: true,
      methodResult: {
        headcountTrend: [
          { month: "2026-10", count: 7 },
          { month: "2026-02", count: 5 },
          { month: "not-a-month", count: 2 },
          { month: "2026-13", count: 3 },
          { month: "2026-03", count: -1 },
          { month: "2026-04", count: 2.5 },
          null,
        ],
      },
    } as never);

    expect(result?.headcountTrend).toEqual([
      { month: "2026-02", count: 5 },
      { month: "2026-10", count: 7 },
    ]);
  });

  it("keeps only the most recent twelve valid headcount months", () => {
    const headcountTrend = Array.from({ length: 15 }, (_, index) => ({
      month: dayjs("2025-01-01").add(index, "month").format("YYYY-MM"),
      count: index,
    }));
    const result = toDashboardOverview({
      success: true,
      methodResult: { headcountTrend },
    } as never);

    expect(result?.headcountTrend).toHaveLength(12);
    expect(result?.headcountTrend[0].month).toBe("2025-04");
    expect(result?.headcountTrend.at(-1)?.month).toBe("2026-03");
  });

  it("normalizes workforce movement, derives net change, and rejects malformed event counts", () => {
    const result = toDashboardOverview({ success: true, methodResult: { workforceMovementTrend: [
      { month: "2026-11", hires: 4, exits: 2 },
      { month: "2026-10", hires: 1, exits: 3 },
      { month: "2026-13", hires: 99, exits: 0 },
      { month: "2026-09", hires: -1, exits: 0 },
      { month: "2026-08", hires: 0, exits: 1.5 },
    ] } } as never);

    expect(result?.workforceMovementTrend).toEqual([
      { month: "2026-10", hires: 1, exits: 3, netChange: -2 },
      { month: "2026-11", hires: 4, exits: 2, netChange: 2 },
    ]);
  });

  it("requires leave cohort status buckets to reconcile with total requests", () => {
    const result = toDashboardOverview({ success: true, methodResult: { leaveRequestCohortTrend: [
      { month: "2026-10", totalRequests: 3, pending: 1, approved: 1, rejected: 0, withdrawn: 1, otherStatus: 0 },
      { month: "2026-11", totalRequests: 3, pending: 1, approved: 1, rejected: 0, withdrawn: 0, otherStatus: 1 },
      { month: "2026-12", totalRequests: 3, pending: 1, approved: 1, rejected: 0, withdrawn: 0, otherStatus: 0 },
      { month: "invalid", totalRequests: 0, pending: 0, approved: 0, rejected: 0, withdrawn: 0, otherStatus: 0 },
    ] } } as never);

    expect(result?.leaveRequestCohortTrend).toEqual([
      { month: "2026-10", totalRequests: 3, pending: 1, approved: 1, rejected: 0, withdrawn: 1, otherStatus: 0 },
      { month: "2026-11", totalRequests: 3, pending: 1, approved: 1, rejected: 0, withdrawn: 0, otherStatus: 1 },
    ]);
  });

  it("normalizes module availability and fails closed when an explicit contract is malformed", () => {
    const legacy = toDashboardOverview({ success: true, methodResult: {} } as never);
    expect(legacy?.sourceAvailability).toBeUndefined();

    const current = toDashboardOverview({ success: true, methodResult: { sourceAvailability: {
      employees: true, attendance: false, leaveManagement: true, jobs: true, offboarding: false,
    } } } as never);
    expect(current?.sourceAvailability).toEqual({
      employees: true, attendance: false, leaveManagement: true, jobs: true, offboarding: false,
    });

    const malformed = toDashboardOverview({ success: true, methodResult: { sourceAvailability: {
      employees: true, attendance: "enabled", leaveManagement: true, jobs: true, offboarding: true,
    } } } as never);
    expect(malformed?.sourceAvailability).toEqual({
      employees: false, attendance: false, leaveManagement: false, jobs: false, offboarding: false,
    });
  });

  it("keeps only documented general dashboard activity types", () => {
    const result = toDashboardOverview({
      success: true,
      methodResult: {
        recentActivities: [
          { type: "SALARYREVISED", employeeName: "Employee One", occurredAt: "2026-11-16T10:00:00Z" },
          { type: "payrollExported", employeeName: "Employee Two", occurredAt: "2026-11-16T09:30:00Z" },
          { type: "JOINED", employeeName: "Employee Three", occurredAt: "2026-11-16T09:00:00Z" },
          { type: "leaveApproved", employeeName: "Employee Four", occurredAt: "2026-11-16T08:30:00Z" },
        ],
      },
    } as never);

    expect(result?.recentActivities.map((activity) => activity.type)).toEqual(["joined", "leaveApproved"]);
  });

  it("fails closed for malformed scalar counts while retaining finite decimal percentages", () => {
    const result = toDashboardOverview({
      success: true,
      methodResult: {
        totalEmployees: 3.5,
        presentToday: -2,
        onLeaveToday: Number.POSITIVE_INFINITY,
        absentToday: 0,
        openPositions: 1.25,
        totalEmployeesChangePercent: 6.25,
      },
    } as never);

    expect(result).toMatchObject({
      totalEmployees: 0,
      presentToday: 0,
      onLeaveToday: 0,
      absentToday: 0,
      openPositions: 0,
      totalEmployeesChangePercent: 6.25,
    });

    const nonFinitePercent = toDashboardOverview({
      success: true,
      methodResult: { totalEmployeesChangePercent: Number.POSITIVE_INFINITY },
    } as never);
    expect(nonFinitePercent?.totalEmployeesChangePercent).toBeNull();
  });

  it("picks the greeting from the hour", () => {
    expect(greetingKey(9)).toBe("DASHBOARD.GREETING.MORNING");
    expect(greetingKey(12)).toBe("DASHBOARD.GREETING.AFTERNOON");
    expect(greetingKey(19)).toBe("DASHBOARD.GREETING.EVENING");
  });

  it("orders departments by size and folds the tail into Others", () => {
    const deps = Array.from({ length: 8 }, (_, n) => ({ departmentId: `d${n}`, label: { en: `Dep ${n}` }, employeeCount: n + 1 }));
    const rows = departmentRows(deps, (d) => d.label.en, "Others", 6);
    expect(rows.map((r) => r.name)).toEqual(["Dep 7", "Dep 6", "Dep 5", "Dep 4", "Dep 3", "Dep 2", "Others"]);
    expect(rows.at(-1)).toMatchObject({ count: 3, isOthers: true });
    expect(Math.round(rows.reduce((sum, r) => sum + r.percent, 0))).toBe(100);
  });

  it("merges reminders by date and drops past ones", () => {
    const today = dayjs("2026-11-15");
    const reminders = mergeReminders(
      {
        holiday: [{ id: "h1", name: "Guru Nanak Jayanti", date: "2026-11-24", description: "", type: 1, imageUrl: null }],
        event: [{ id: "e1", name: "Team Meetup", date: "2026-11-17", description: "", type: 2, imageUrl: null }],
      },
      {
        birthday: [{ employeeId: "u1", employeeName: "Pawan", profileUrl: null, jobRole: {}, date: "2026-11-10", ordinal: 30 }],
        workAnniversary: [{ employeeId: "u2", employeeName: "Manish", profileUrl: null, jobRole: {}, date: "2026-11-19", ordinal: 2 }],
      },
      today,
    );
    expect(reminders.map((r) => r.id)).toEqual(["event-e1", "anniversary-u2", "holiday-h1"]);
  });
});
