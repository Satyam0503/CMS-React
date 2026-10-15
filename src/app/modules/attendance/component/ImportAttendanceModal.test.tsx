import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ImportAttendanceModal } from "./ImportAttendanceModal";
import * as attendanceServices from "../AttendanceServices";

vi.mock("@mui/icons-material", () => ({}));
vi.mock("@mui/icons-material/CloudUploadOutlined", () => ({ default: () => null }));
vi.mock("@mui/icons-material/DownloadOutlined", () => ({ default: () => null }));
vi.mock("@mui/icons-material/CheckCircleOutline", () => ({ default: () => null }));
vi.mock("@mui/icons-material/ErrorOutline", () => ({ default: () => null }));
vi.mock("@mui/icons-material/Close", () => ({ default: () => null }));
vi.mock("@mui/icons-material/InsertDriveFileOutlined", () => ({ default: () => null }));
vi.mock("@mui/icons-material/Refresh", () => ({ default: () => null }));

vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("ImportAttendanceModal", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    const currentRoot = root;
    if (currentRoot) {
      act(() => {
        currentRoot.unmount();
      });
    }
    if (container) {
      container.remove();
    }
    vi.clearAllMocks();
  });

  it("renders modal with month, year, template download, and upload controls when open", async () => {
    await act(async () => {
      root!.render(
        <ImportAttendanceModal
          open={true}
          handleClose={vi.fn()}
          initialYear={2026}
          initialMonth={10}
        />
      );
    });

    const modalTitle = document.querySelector("h6");
    expect(modalTitle?.textContent).toContain("Import Monthly Attendance");

    const downloadButton = Array.from(document.querySelectorAll("button")).find((btn) =>
      btn.textContent?.includes("Download Template")
    );
    expect(downloadButton).toBeTruthy();

    const commitButton = Array.from(document.querySelectorAll("button")).find((btn) =>
      btn.textContent?.includes("Commit Attendance Import")
    );
    expect(commitButton).toBeTruthy();
    expect(commitButton?.hasAttribute("disabled")).toBe(true);
  });

  it("calls downloadAttendanceImportTemplate when Download Template button is clicked", async () => {
    const downloadSpy = vi
      .spyOn(attendanceServices, "downloadAttendanceImportTemplate")
      .mockResolvedValueOnce({
        data: new Blob(["test"], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
      } as any);

    await act(async () => {
      root!.render(
        <ImportAttendanceModal
          open={true}
          handleClose={vi.fn()}
          initialYear={2026}
          initialMonth={10}
        />
      );
    });

    const downloadButton = Array.from(document.querySelectorAll("button")).find((btn) =>
      btn.textContent?.includes("Download Template")
    );
    expect(downloadButton).toBeTruthy();

    await act(async () => {
      downloadButton!.click();
    });

    expect(downloadSpy).toHaveBeenCalledWith(2026, 10);
  });

  it("rejects non-xlsx files and triggers an error notification", async () => {
    const { toast } = await import("react-toastify");

    await act(async () => {
      root!.render(
        <ImportAttendanceModal
          open={true}
          handleClose={vi.fn()}
          initialYear={2026}
          initialMonth={10}
        />
      );
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeTruthy();

    const invalidFile = new File(["dummy content"], "attendance.csv", { type: "text/csv" });
    Object.defineProperty(fileInput, "files", {
      value: [invalidFile],
      writable: true,
    });

    await act(async () => {
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));
    });

    expect(toast.error).toHaveBeenCalledWith("Please upload an Excel file (.xlsx)");
  });

  it("handles successful validation and commits attendance import", async () => {
    const { toast } = await import("react-toastify");
    const onImportSuccess = vi.fn();
    const handleClose = vi.fn();

    vi.spyOn(attendanceServices, "validateAttendanceImport").mockResolvedValueOnce({
      data: {
        isValid: true,
        totalEmployees: 5,
        totalDaysInMonth: 31,
        totalCellsProcessed: 155,
        validEntriesCount: 150,
        preservedLeavesCount: 5,
        warningCount: 1,
        errorCount: 0,
        issues: [
          {
            rowNumber: 2,
            columnHeader: "05 Oct (Mon)",
            employeeId: "EMP-001",
            employeeName: "John Doe",
            date: "2026-10-05",
            severity: "Warning",
            message: "Employee has approved leave on 2026-10-05. Existing leave will be preserved.",
          },
        ],
      },
    } as any);

    vi.spyOn(attendanceServices, "commitAttendanceImport").mockResolvedValueOnce({
      data: {
        success: true,
        message: "Successfully imported 150 attendance records across 5 employees.",
        employeesAffected: 5,
        recordsUpserted: 150,
        preservedLeavesCount: 5,
        issues: [],
      },
    } as any);

    await act(async () => {
      root!.render(
        <ImportAttendanceModal
          open={true}
          handleClose={handleClose}
          initialYear={2026}
          initialMonth={10}
          onImportSuccess={onImportSuccess}
        />
      );
    });

    // Select valid file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validFile = new File(["dummy xlsx"], "Attendance_2026_10.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    Object.defineProperty(fileInput, "files", {
      value: [validFile],
      writable: true,
    });

    await act(async () => {
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));
    });

    // Click Pre-flight Validate
    const validateButton = Array.from(document.querySelectorAll("button")).find((btn) =>
      btn.textContent?.includes("Pre-flight Validate")
    );
    expect(validateButton).toBeTruthy();

    await act(async () => {
      validateButton!.click();
    });

    // Commit button should now be enabled
    const commitButton = Array.from(document.querySelectorAll("button")).find((btn) =>
      btn.textContent?.includes("Commit Attendance Import")
    );
    expect(commitButton).toBeTruthy();
    expect(commitButton?.hasAttribute("disabled")).toBe(false);

    // Click Commit
    await act(async () => {
      commitButton!.click();
    });

    expect(attendanceServices.commitAttendanceImport).toHaveBeenCalledWith(
      validFile,
      2026,
      10,
      true
    );
    expect(toast.success).toHaveBeenCalledWith(
      "Successfully imported 150 attendance records across 5 employees."
    );
    expect(onImportSuccess).toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalled();
  });

  it("displays error alert and issue table when validation fails, keeping commit button disabled", async () => {
    vi.spyOn(attendanceServices, "validateAttendanceImport").mockResolvedValueOnce({
      data: {
        isValid: false,
        totalEmployees: 2,
        totalDaysInMonth: 31,
        totalCellsProcessed: 62,
        validEntriesCount: 50,
        preservedLeavesCount: 0,
        warningCount: 0,
        errorCount: 2,
        issues: [
          {
            rowNumber: 2,
            columnHeader: "01 Oct (Thu)",
            employeeId: "EMP-001",
            employeeName: "John Doe",
            date: "2026-10-01",
            severity: "Error",
            message: "Cannot mark attendance prior to joining date (2026-10-10). Cell must be 'N/A'.",
          },
        ],
      },
    } as any);

    await act(async () => {
      root!.render(
        <ImportAttendanceModal
          open={true}
          handleClose={vi.fn()}
          initialYear={2026}
          initialMonth={10}
        />
      );
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validFile = new File(["dummy xlsx"], "Attendance_Errors.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    Object.defineProperty(fileInput, "files", {
      value: [validFile],
      writable: true,
    });

    await act(async () => {
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));
    });

    const validateButton = Array.from(document.querySelectorAll("button")).find((btn) =>
      btn.textContent?.includes("Pre-flight Validate")
    );
    await act(async () => {
      validateButton!.click();
    });

    // Verify error text is rendered in modal
    expect(document.body.textContent).toContain("Validation failed with 2 blocking error(s)");
    expect(document.body.textContent).toContain("Cannot mark attendance prior to joining date");

    // Commit button must remain disabled
    const commitButton = Array.from(document.querySelectorAll("button")).find((btn) =>
      btn.textContent?.includes("Commit Attendance Import")
    );
    expect(commitButton?.hasAttribute("disabled")).toBe(true);
  });
});

