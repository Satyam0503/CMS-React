import dayjs from "dayjs";
import { describe, expect, it } from "vitest";
import { attendanceBreakdown, departmentRows, greetingKey, mergeReminders, percentOf } from "./dashboardMetrics";
import { DashboardOverview } from "./model";

const overview = (patch: Partial<DashboardOverview> = {}): DashboardOverview => ({
  totalEmployees: 142,
  totalEmployeesChangePercent: 6,
  presentToday: 128,
  onLeaveToday: 9,
  absentToday: 5,
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

  it("splits today's attendance like the reference (90.1 / 6.3 / 3.5)", () => {
    const { tracked, slices, presentPercent } = attendanceBreakdown(overview());
    expect(tracked).toBe(142);
    expect(presentPercent).toBe(90.1);
    expect(slices.map((s) => s.percent)).toEqual([90.1, 6.3, 3.5]);
  });

  it("reports nothing tracked on a day with no attendance", () => {
    const { tracked, presentPercent } = attendanceBreakdown(overview({ presentToday: 0, onLeaveToday: 0, absentToday: 0, isWorkingDay: false }));
    expect(tracked).toBe(0);
    expect(presentPercent).toBe(0);
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
