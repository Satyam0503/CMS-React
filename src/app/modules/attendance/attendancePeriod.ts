import dayjs, { Dayjs } from "dayjs";

export const attendancePeriods = [
  { value: "today", label: "Today" },
  { value: "this-week", label: "This Week" },
  { value: "this-month", label: "This Month" },
  { value: "two-weeks", label: "2 Weeks" },
  { value: "previous-month", label: "Previous Month" },
] as const;

export type AttendancePeriod = typeof attendancePeriods[number]["value"];

export interface AttendanceDateRange {
  startDate: Dayjs;
  endDate: Dayjs;
}

// Keep all attendance consumers on the application's existing locale-week convention.
export const resolveAttendanceDateRange = (
  period: AttendancePeriod,
  businessDate: Dayjs = dayjs(),
): AttendanceDateRange => {
  const today = businessDate.startOf("day");

  switch (period) {
    case "this-week":
      return { startDate: today.startOf("week"), endDate: today };
    case "this-month":
      return { startDate: today.startOf("month"), endDate: today };
    case "two-weeks":
      return { startDate: today.subtract(13, "day"), endDate: today };
    case "previous-month": {
      const previousMonth = today.subtract(1, "month");
      return { startDate: previousMonth.startOf("month"), endDate: previousMonth.endOf("month") };
    }
    default:
      return { startDate: today, endDate: today };
  }
};
