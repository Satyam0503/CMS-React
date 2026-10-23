import { describe, expect, it } from "vitest";
import {
  deriveAttendanceStatus,
  getDerivedStatusExplanation,
  timeToMinutes,
  formatMinutesToTime,
  ShiftScheduleInfo,
} from "./attendanceStatusCalculation";

describe("Attendance Status Auto-Calculation", () => {
  const defaultEmployee: ShiftScheduleInfo = {
    scheduledStartTime: "09:00",
    scheduledEndTime: "18:00",
    punchInAllowedFrom: "08:30",
    punchInAllowedUntil: "10:00",
    punchOutAllowedFrom: "17:00",
    punchOutAllowedUntil: "19:00",
  };

  it("calculates Present (P) when check-in and check-out are within standard schedule", () => {
    const status = deriveAttendanceStatus("09:00", "18:00", defaultEmployee);
    expect(status).toBe("P");
  });

  it("calculates Present (P) when arrival is within grace period (09:15)", () => {
    const status = deriveAttendanceStatus("09:15", "18:00", defaultEmployee);
    expect(status).toBe("P");
  });

  it("calculates Late Arrival (LHD) when punch-in is after grace period but before 10:00 AM", () => {
    const status = deriveAttendanceStatus("09:30", "18:00", defaultEmployee);
    expect(status).toBe("LHD");
  });

  it("calculates Early Departure (ED) when punch-out is before grace period but after 17:00 PM", () => {
    const status = deriveAttendanceStatus("09:00", "17:30", defaultEmployee);
    expect(status).toBe("ED");
  });

  it("calculates Half Day (HD) when punch-in is after 10:00 AM (e.g. 11:01 AM - Satyam Dubey case)", () => {
    const status = deriveAttendanceStatus("11:01", "18:00", defaultEmployee);
    expect(status).toBe("HD");

    const explanation = getDerivedStatusExplanation("HD", "11:01", "18:00", defaultEmployee);
    expect(explanation).toContain("Half Day");
    expect(explanation).toContain("11:01");
  });

  it("calculates Half Day (HD) when punch-out is before 17:00 PM", () => {
    const status = deriveAttendanceStatus("09:00", "16:30", defaultEmployee);
    expect(status).toBe("HD");
  });

  it("calculates LHD+ED when both arriving late and leaving early within the 1-hour window", () => {
    const status = deriveAttendanceStatus("09:30", "17:30", defaultEmployee);
    expect(status).toBe("LHD+ED");
  });

  it("calculates Absent (A) when total hours worked are less than 4.0 hours", () => {
    const status = deriveAttendanceStatus("10:00", "13:30", defaultEmployee);
    expect(status).toBe("A");

    const explanation = getDerivedStatusExplanation("A", "10:00", "13:30", defaultEmployee);
    expect(explanation).toContain("Absent");
    expect(explanation).toContain("under 4.0 hours");
  });

  it("parses time formats correctly with timeToMinutes", () => {
    expect(timeToMinutes("09:00")).toBe(540);
    expect(timeToMinutes("9:00")).toBe(540);
    expect(timeToMinutes("11:01")).toBe(661);
    expect(timeToMinutes("18:00")).toBe(1080);
    expect(timeToMinutes("invalid")).toBeNull();
  });

  it("formats minutes to human readable AM/PM time", () => {
    expect(formatMinutesToTime(540)).toBe("9:00 AM");
    expect(formatMinutesToTime(600)).toBe("10:00 AM");
    expect(formatMinutesToTime(1080)).toBe("6:00 PM");
  });

  it("calculates Present (P) for Shift 2 (09:30-18:30) with custom 60-minute grace period", () => {
    const shift2Employee: ShiftScheduleInfo = {
      scheduledStartTime: "09:30",
      scheduledEndTime: "18:30",
      punchInAllowedFrom: "08:30",
      punchInAllowedUntil: "10:30",
      punchOutAllowedFrom: "17:30",
      punchOutAllowedUntil: "19:30",
      graceMinutes: 60,
    };

    const status = deriveAttendanceStatus("09:30", "18:30", shift2Employee);
    expect(status).toBe("P");

    const explanation = getDerivedStatusExplanation("P", "09:30", "18:30", shift2Employee);
    expect(explanation).toContain("Present");
    expect(explanation).toContain("9:30 AM");
    expect(explanation).toContain("6:30 PM");
  });
});
