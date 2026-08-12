import { describe, expect, it } from "vitest";
import {
  ATTENDANCE_EMPLOYEE_COLUMN_WIDTH,
  buildAttendanceGridScrollContainerSx,
} from "./attendanceGridLayout";

describe("Attendance calendar layout", () => {
  it("pins the employee column and gives the scroll container independent horizontal and vertical scrolling", () => {
    const style = buildAttendanceGridScrollContainerSx({
      palette: {
        background: { paper: "#fff", default: "#fafafa" },
        action: { hover: "#eee" },
        primary: { light: "#999", main: "#111" },
      },
    } as any);

    expect(ATTENDANCE_EMPLOYEE_COLUMN_WIDTH).toBeGreaterThanOrEqual(170);
    expect(style.overflowX).toBe("auto");
    expect(style.overflowY).toBe("auto");
    expect(style.maxHeight).toBeTruthy();
    expect(style["& .MuiDataGrid-cell[data-field='name']"]?.position).toBe("sticky");
    expect(style["& .MuiDataGrid-cell[data-field='name']"]?.left).toBe(0);
  });
});
