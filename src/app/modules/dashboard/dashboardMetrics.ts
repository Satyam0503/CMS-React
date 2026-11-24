import dayjs, { Dayjs } from "dayjs";
import {
  CelebrationModule,
  DashboardActivity,
  DashboardOverview,
  DepartmentResponseModel,
  GetDashboardOverviewData,
  UpComingHolidayAndEventModel,
  UpcomingCelebration,
} from "./model";

const count = (value: unknown) =>
  typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : 0;
const HEADCOUNT_TREND_MONTHS = 12;

const dashboardActivityTypes = new Map<string, DashboardActivity["type"]>([
  ["joined", "joined"],
  ["leaveapproved", "leaveApproved"],
  ["exitinitiated", "exitInitiated"],
  ["jobposted", "jobPosted"],
]);

/** Normalises the API payload so widgets never deal with missing arrays or negative counts. */
export const toDashboardOverview = (
  response: GetDashboardOverviewData | undefined,
): DashboardOverview | null => {
  const raw = response?.success ? response.methodResult : null;
  if (!raw) return null;
  const breakdownRaw = raw.attendanceBreakdown;
  const normalizedBreakdown = breakdownRaw && typeof breakdownRaw === "object"
    ? {
        definitionVersion: typeof breakdownRaw.definitionVersion === "string" ? breakdownRaw.definitionVersion : undefined,
        expectedEmployees: count(breakdownRaw.expectedEmployees),
        presentOnly: count(breakdownRaw.presentOnly),
        leaveOnly: count(breakdownRaw.leaveOnly),
        presentAndOnLeave: count(breakdownRaw.presentAndOnLeave),
        explicitlyAbsent: count(breakdownRaw.explicitlyAbsent),
        otherStatus: count(breakdownRaw.otherStatus),
        unreported: count(breakdownRaw.unreported),
      }
    : null;
  const breakdownTotal = normalizedBreakdown
    ? normalizedBreakdown.presentOnly + normalizedBreakdown.leaveOnly + normalizedBreakdown.presentAndOnLeave + normalizedBreakdown.explicitlyAbsent + normalizedBreakdown.otherStatus + normalizedBreakdown.unreported
    : -1;
  const breakdownFields = breakdownRaw && typeof breakdownRaw === "object"
    ? [breakdownRaw.expectedEmployees, breakdownRaw.presentOnly, breakdownRaw.leaveOnly, breakdownRaw.presentAndOnLeave, breakdownRaw.explicitlyAbsent, breakdownRaw.otherStatus, breakdownRaw.unreported]
    : [];
  const breakdownValuesValid = breakdownFields.length === 7 && breakdownFields.every((value) => typeof value === "number" && Number.isInteger(value) && value >= 0);
  const attendanceBreakdown = normalizedBreakdown?.definitionVersion === "attendance-breakdown.v1" && breakdownValuesValid && breakdownTotal === normalizedBreakdown.expectedEmployees
    ? normalizedBreakdown
    : null;
  const availabilityKeys = ["employees", "attendance", "leaveManagement", "jobs", "offboarding"] as const;
  const availabilityRaw = raw.sourceAvailability;
  const sourceAvailability = availabilityRaw === undefined
    ? undefined
    : availabilityRaw && typeof availabilityRaw === "object" && availabilityKeys.every((key) => typeof availabilityRaw[key] === "boolean")
      ? Object.fromEntries(availabilityKeys.map((key) => [key, availabilityRaw[key]])) as DashboardOverview["sourceAvailability"]
      : { employees: false, attendance: false, leaveManagement: false, jobs: false, offboarding: false };
  return {
    definitionVersion: typeof raw.definitionVersion === "string" ? raw.definitionVersion : undefined,
    asOfDate: typeof raw.asOfDate === "string" ? raw.asOfDate : null,
    timeZone: typeof raw.timeZone === "string" ? raw.timeZone : undefined,
    generatedAtUtc: typeof raw.generatedAtUtc === "string" ? raw.generatedAtUtc : null,
    sourceAvailability,
    totalEmployees: count(raw.totalEmployees),
    totalEmployeesChangePercent:
      typeof raw.totalEmployeesChangePercent === "number" && Number.isFinite(raw.totalEmployeesChangePercent)
        ? raw.totalEmployeesChangePercent
        : null,
    presentToday: count(raw.presentToday),
    onLeaveToday: count(raw.onLeaveToday),
    absentToday: count(raw.absentToday),
    attendanceBreakdown,
    isWorkingDay: raw.isWorkingDay !== false,
    openPositions: count(raw.openPositions),
    headcountTrend: Array.isArray(raw.headcountTrend)
      ? raw.headcountTrend
          .flatMap((point) => {
            if (
              !point ||
              typeof point.month !== "string" ||
              !/^\d{4}-(0[1-9]|1[0-2])$/.test(point.month) ||
              !Number.isInteger(point.count) ||
              point.count < 0
            ) {
              return [];
            }
            return [{ month: point.month, count: point.count }];
          })
          .sort((a, b) => a.month.localeCompare(b.month))
          .slice(-HEADCOUNT_TREND_MONTHS)
      : [],
    workforceMovementTrend: Array.isArray(raw.workforceMovementTrend)
      ? raw.workforceMovementTrend
          .flatMap((point) => {
            if (!point || typeof point.month !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(point.month)
              || !Number.isInteger(point.hires) || point.hires < 0
              || !Number.isInteger(point.exits) || point.exits < 0) return [];
            return [{ month: point.month, hires: point.hires, exits: point.exits, netChange: point.hires - point.exits }];
          })
          .sort((a, b) => a.month.localeCompare(b.month))
          .slice(-HEADCOUNT_TREND_MONTHS)
      : [],
    leaveRequestCohortTrend: Array.isArray(raw.leaveRequestCohortTrend)
      ? raw.leaveRequestCohortTrend
          .flatMap((point) => {
            const values = [point?.totalRequests, point?.pending, point?.approved, point?.rejected, point?.withdrawn, point?.otherStatus];
            if (!point || typeof point.month !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(point.month)
              || values.some((value) => !Number.isInteger(value) || (value as number) < 0)
              || values.slice(1).reduce((total, value) => total + (value as number), 0) !== point.totalRequests) return [];
            return [{ month: point.month, totalRequests: point.totalRequests, pending: point.pending, approved: point.approved,
              rejected: point.rejected, withdrawn: point.withdrawn, otherStatus: point.otherStatus }];
          })
          .sort((a, b) => a.month.localeCompare(b.month))
          .slice(-HEADCOUNT_TREND_MONTHS)
      : [],
    // Retain only the documented general-dashboard events. This also prevents legacy
    // or future APIs from surfacing payroll or other unreviewed event data here.
    recentActivities: Array.isArray(raw.recentActivities)
      ? raw.recentActivities.flatMap((activity) => {
          const canonicalType = dashboardActivityTypes.get(String(activity?.type).toLowerCase());
          return canonicalType ? [{ ...activity, type: canonicalType }] : [];
        })
      : [],
  };
};

/** Percentage with one decimal; 0 when the base is empty. */
export const percentOf = (part: number, total: number) =>
  total > 0 ? Math.round((part / total) * 1000) / 10 : 0;

export type AttendanceSlice = {
  key: "presentOnly" | "leaveOnly" | "presentAndOnLeave" | "absent" | "otherStatus" | "unreported";
  count: number;
  percent: number;
};

export const attendanceBreakdown = (overview: DashboardOverview) => {
  const definition = overview.attendanceBreakdown;
  const tracked = count(definition?.expectedEmployees);
  const values = [
    ["presentOnly", count(definition?.presentOnly)],
    ["leaveOnly", count(definition?.leaveOnly)],
    ["presentAndOnLeave", count(definition?.presentAndOnLeave)],
    ["absent", count(definition?.explicitlyAbsent)],
    ["otherStatus", count(definition?.otherStatus)],
    ["unreported", count(definition?.unreported)],
  ] as const;
  const slices: AttendanceSlice[] = values.map(([key, value]) => ({ key, count: value, percent: percentOf(value, tracked) }));
  const worked = count(definition?.presentOnly) + count(definition?.presentAndOnLeave);
  return { tracked, slices, presentPercent: percentOf(worked, tracked) };
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
