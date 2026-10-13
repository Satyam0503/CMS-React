import { describe, expect, it } from "vitest";
import {
  buildAttendanceStatusColorMap,
  DEFAULT_ATTENDANCE_STATUS_COLOR,
  normalizeAttendanceStatusCode,
  resolveAttendanceStatusColor,
} from "./attendanceStatusColors";

describe("attendance status colors", () => {
  it("builds a color map keyed by normalized status code", () => {
    const map = buildAttendanceStatusColorMap([
      { code: "P", colorHex: "#00ff00" },
      { code: " wfh ", colorHex: "#123456" },
      { code: "invalid", colorHex: "red" },
    ]);

    expect(map).toEqual({
      P: "#00FF00",
      WFH: "#123456",
    });
  });

  it("falls back to the neutral default and normalizes status codes", () => {
    expect(normalizeAttendanceStatusCode(" wfh ")).toBe("WFH");
    expect(resolveAttendanceStatusColor("missing", { P: "#00FF00" })).toBe(DEFAULT_ATTENDANCE_STATUS_COLOR);
    expect(resolveAttendanceStatusColor("p", { P: "#00FF00" })).toBe("#00FF00");
  });
});
