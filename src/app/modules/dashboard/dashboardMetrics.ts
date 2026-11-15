import dayjs, { Dayjs } from "dayjs";
import {
  CelebrationModule,
  DashboardOverview,
  DepartmentResponseModel,
  GetDashboardOverviewData,
  UpComingHolidayAndEventModel,
  UpcomingCelebration,
} from "./model";

const count = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;

/** Normalises the API payload so widgets never deal with missing arrays or negative counts. */
export const toDashboardOverview = (
  response: GetDashboardOverviewData | undefined,
): DashboardOverview | null => {
  const raw = response?.success ? response.methodResult : null;
  if (!raw) return null;
  return {
    totalEmployees: count(raw.totalEmployees),
    totalEmployeesChangePercent:
      typeof raw.totalEmployeesChangePercent === "number" ? raw.totalEmployeesChangePercent : null,
    presentToday: count(raw.presentToday),
    onLeaveToday: count(raw.onLeaveToday),
    absentToday: count(raw.absentToday),
    isWorkingDay: raw.isWorkingDay !== false,
    openPositions: count(raw.openPositions),
    headcountTrend: Array.isArray(raw.headcountTrend)
      ? [...raw.headcountTrend].sort((a, b) => a.month.localeCompare(b.month))
      : [],
    recentActivities: Array.isArray(raw.recentActivities) ? raw.recentActivities : [],
  };
};

/** Percentage with one decimal; 0 when the base is empty. */
export const percentOf = (part: number, total: number) =>
  total > 0 ? Math.round((part / total) * 1000) / 10 : 0;

export type AttendanceSlice = { key: "present" | "onLeave" | "absent"; count: number; percent: number };

export const attendanceBreakdown = (overview: DashboardOverview) => {
  const tracked = overview.presentToday + overview.onLeaveToday + overview.absentToday;
  const slices: AttendanceSlice[] = [
    { key: "present", count: overview.presentToday, percent: percentOf(overview.presentToday, tracked) },
    { key: "onLeave", count: overview.onLeaveToday, percent: percentOf(overview.onLeaveToday, tracked) },
    { key: "absent", count: overview.absentToday, percent: percentOf(overview.absentToday, tracked) },
  ];
  return { tracked, slices, presentPercent: slices[0].percent };
};

export const greetingKey = (hour: number) =>
  hour < 12 ? "DASHBOARD.GREETING.MORNING" : hour < 17 ? "DASHBOARD.GREETING.AFTERNOON" : "DASHBOARD.GREETING.EVENING";

export type DepartmentRow = { id: string; name: string; count: number; percent: number; isOthers?: boolean };

/** Largest departments first; anything past `limit` is folded into one "Others" row. */
export const departmentRows = (
  departments: DepartmentResponseModel[],
  resolveName: (dep: DepartmentResponseModel) => string,
  othersLabel: string,
  limit = 6,
): DepartmentRow[] => {
  const total = departments.reduce((sum, dep) => sum + count(dep.employeeCount), 0);
  const sorted = [...departments].sort((a, b) => count(b.employeeCount) - count(a.employeeCount));
  const rows: DepartmentRow[] = sorted.slice(0, limit).map((dep) => ({
    id: dep.departmentId,
    name: resolveName(dep),
    count: count(dep.employeeCount),
    percent: percentOf(count(dep.employeeCount), total),
  }));
  const rest = sorted.slice(limit).reduce((sum, dep) => sum + count(dep.employeeCount), 0);
  if (rest > 0) rows.push({ id: "others", name: othersLabel, count: rest, percent: percentOf(rest, total), isOthers: true });
  return rows;
};

export type ReminderKind = "holiday" | "event" | "birthday" | "anniversary";
export type Reminder = { id: string; kind: ReminderKind; name: string; date: Dayjs; ordinal?: number };

/** Holidays, events and celebrations as one date-ordered list, skipping anything already past. */
export const mergeReminders = (
  events: UpComingHolidayAndEventModel | null,
  celebrations: UpcomingCelebration | null,
  today: Dayjs = dayjs(),
): Reminder[] => {
  const fromCelebration = (kind: "birthday" | "anniversary") => (c: CelebrationModule): Reminder => ({
    id: `${kind}-${c.employeeId}`,
    kind,
    name: c.employeeName,
    date: dayjs(c.date),
    ordinal: c.ordinal,
  });
  const all: Reminder[] = [
    ...(events?.holiday ?? []).map((h) => ({ id: `holiday-${h.id}`, kind: "holiday" as const, name: h.name, date: dayjs(h.date) })),
    ...(events?.event ?? []).map((e) => ({ id: `event-${e.id}`, kind: "event" as const, name: e.name, date: dayjs(e.date) })),
    ...(celebrations?.birthday ?? []).map(fromCelebration("birthday")),
    ...(celebrations?.workAnniversary ?? []).map(fromCelebration("anniversary")),
  ];
  return all
    .filter((r) => r.date.isValid() && !r.date.isBefore(today, "day"))
    .sort((a, b) => a.date.valueOf() - b.date.valueOf());
};
