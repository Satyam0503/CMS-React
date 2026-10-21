import dayjs from "dayjs";
import { AttendanceStatus } from "./AttendanceModels";

export interface ShiftScheduleInfo {
  id?: string;
  employeeId?: string;
  name?: string;
  scheduledStartTime?: string | null;
  scheduledEndTime?: string | null;
  punchInAllowedFrom?: string | null;
  punchInAllowedUntil?: string | null;
  punchOutAllowedFrom?: string | null;
  punchOutAllowedUntil?: string | null;
  [key: string]: any;
}

export const formatTimePreset = (value: string) =>
  dayjs(`2000-01-01T${value}`).format("h:mm A");

export const timeToMinutes = (value?: string | null): number | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!/^\d{1,2}:\d{2}$/.test(trimmed)) return null;
  const [hours, minutes] = trimmed.split(":").map(Number);
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : null;
};

export const formatMinutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour}:${String(m).padStart(2, "0")} ${ampm}`;
};

export const deriveAttendanceStatus = (
  checkInStr: string,
  checkOutStr: string,
  employee?: ShiftScheduleInfo | null,
  validStatusOptions?: Array<{ value: AttendanceStatus | string }>,
): AttendanceStatus | null => {
  const inMinutes = timeToMinutes(checkInStr);
  const outMinutes = timeToMinutes(checkOutStr);

  if (inMinutes === null || outMinutes === null) {
    return null;
  }

  let durationMinutes = outMinutes - inMinutes;
  if (durationMinutes < 0) {
    durationMinutes += 24 * 60;
  }
  const totalHours = durationMinutes / 60;

  const minHalfDayHours = 4.0;
  if (totalHours <= 0 || totalHours < minHalfDayHours) {
    return "A";
  }

  const shiftStartMinutes = timeToMinutes(employee?.scheduledStartTime) ?? 9 * 60;
  const shiftEndMinutes = timeToMinutes(employee?.scheduledEndTime) ?? 18 * 60;
  const graceMinutes = 15;

  const lateArrivalStart = shiftStartMinutes + graceMinutes;
  const earlyDepartureStart = shiftEndMinutes - graceMinutes;

  const halfDayCheckInBoundary =
    timeToMinutes(employee?.punchInAllowedUntil) ?? (shiftStartMinutes + 60);
  const halfDayCheckOutBoundary =
    timeToMinutes(employee?.punchOutAllowedFrom) ?? (shiftEndMinutes - 60);

  const isLate = inMinutes > lateArrivalStart;
  const isEarly = outMinutes < earlyDepartureStart;
  const exceedsLateLimit = inMinutes > halfDayCheckInBoundary;
  const exceedsEarlyLimit = outMinutes < halfDayCheckOutBoundary;

  let calculated: AttendanceStatus = "P";
  if (exceedsLateLimit || exceedsEarlyLimit) {
    calculated = "HD";
  } else if (isLate && isEarly) {
    calculated = "LHD+ED";
  } else if (isLate) {
    calculated = "LHD";
  } else if (isEarly) {
    calculated = "ED";
  } else {
    calculated = "P";
  }

  if (validStatusOptions && validStatusOptions.length > 0) {
    const hasOption = validStatusOptions.some((o) => o.value === calculated);
    if (!hasOption) {
      if (calculated === "LHD+ED") {
        if (validStatusOptions.some((o) => o.value === "HD")) return "HD";
        if (validStatusOptions.some((o) => o.value === "LHD")) return "LHD";
      }
    }
  }

  return calculated;
};

export const getDerivedStatusExplanation = (
  status: AttendanceStatus | "",
  checkInStr: string,
  checkOutStr: string,
  employee?: ShiftScheduleInfo | null,
): string | null => {
  const inMinutes = timeToMinutes(checkInStr);
  const outMinutes = timeToMinutes(checkOutStr);
  if (inMinutes === null || outMinutes === null) return null;

  let durationMinutes = outMinutes - inMinutes;
  if (durationMinutes < 0) durationMinutes += 24 * 60;
  const totalHours = durationMinutes / 60;

  if (totalHours < 4.0) {
    return `Working duration (${totalHours.toFixed(1)} hrs) is under 4.0 hours, automatically classified as Absent.`;
  }

  const shiftStartMinutes = timeToMinutes(employee?.scheduledStartTime) ?? 9 * 60;
  const shiftEndMinutes = timeToMinutes(employee?.scheduledEndTime) ?? 18 * 60;
  const graceMinutes = 15;
  const lateArrivalStart = shiftStartMinutes + graceMinutes;
  const earlyDepartureStart = shiftEndMinutes - graceMinutes;
  const halfDayCheckInBoundary =
    timeToMinutes(employee?.punchInAllowedUntil) ?? (shiftStartMinutes + 60);
  const halfDayCheckOutBoundary =
    timeToMinutes(employee?.punchOutAllowedFrom) ?? (shiftEndMinutes - 60);

  if (inMinutes > halfDayCheckInBoundary) {
    return `Punch-in (${checkInStr}) is after the half-day boundary (${formatMinutesToTime(halfDayCheckInBoundary)}) -> Half Day.`;
  }
  if (outMinutes < halfDayCheckOutBoundary) {
    return `Punch-out (${checkOutStr}) is before the half-day boundary (${formatMinutesToTime(halfDayCheckOutBoundary)}) -> Half Day.`;
  }
  if (inMinutes > lateArrivalStart && outMinutes < earlyDepartureStart) {
    return `Late arrival (after ${formatMinutesToTime(lateArrivalStart)}) & early departure (before ${formatMinutesToTime(earlyDepartureStart)}).`;
  }
  if (inMinutes > lateArrivalStart) {
    return `Punch-in (${checkInStr}) is after grace time (${formatMinutesToTime(lateArrivalStart)}) -> Late Arrival.`;
  }
  if (outMinutes < earlyDepartureStart) {
    return `Punch-out (${checkOutStr}) is before grace time (${formatMinutesToTime(earlyDepartureStart)}) -> Early Departure.`;
  }
  if (status === "P") {
    return `Timings are within standard shift (${formatMinutesToTime(shiftStartMinutes)} – ${formatMinutesToTime(shiftEndMinutes)}) -> Present.`;
  }
  return null;
};
