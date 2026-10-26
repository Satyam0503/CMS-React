import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getRequest: vi.fn(), postRequest: vi.fn(), patchRequest: vi.fn(), toastError: vi.fn(), toastSuccess: vi.fn() }));

vi.mock("../../../../server/axios", () => ({ getRequest: mocks.getRequest, postRequest: mocks.postRequest, patchRequest: mocks.patchRequest }));
vi.mock("react-toastify", () => ({ toast: { error: mocks.toastError, success: mocks.toastSuccess } }));
vi.mock("@mui/icons-material", () => ({ ExpandLess: () => null, ExpandMore: () => null }));
vi.mock("@mui/x-date-pickers/AdapterDayjs", () => ({ AdapterDayjs: class {} }));
vi.mock("@mui/x-date-pickers", () => ({
  DateTimePicker: () => null,
  LocalizationProvider: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));
vi.mock("@mui/material", async () => {
  const ReactModule = await import("react");
  const block = (tag: string) => ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => ReactModule.createElement(tag, props, children);
  const Dialog = ({ open, children }: React.PropsWithChildren<{ open: boolean }>) => open ? <div role="dialog">{children}</div> : null;
  const Collapse = ({ in: open, children }: React.PropsWithChildren<{ in: boolean }>) => open ? <div>{children}</div> : null;
  return {
    Box: block("div"), Card: block("div"), Alert: block("div"), Chip: block("span"), Collapse,
    CircularProgress: () => null, Divider: block("hr"), Dialog, DialogActions: block("div"),
    DialogContent: block("div"), DialogTitle: block("h2"), IconButton: block("button"),
    MenuItem: ({ children, value }: React.PropsWithChildren<{ value?: string }>) => <option value={value}>{children}</option>,
    Stack: block("div"), TablePagination: () => null, Typography: block("div"),
  };
});
vi.mock("../../../shared/components/ui", () => ({
  AppButton: ({ children, onClick, disabled }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button disabled={disabled} onClick={onClick}>{children}</button>,
  AppTextField: ({ label, multiline, onChange, value, children }: React.PropsWithChildren<{ label?: string; multiline?: boolean; onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>; value?: string }>) => (
    <label>{label}{multiline ? <textarea value={value} onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>} /> : <input value={value} onChange={onChange as React.ChangeEventHandler<HTMLInputElement>} />}{children}</label>
  ),
}));
vi.mock("../../../shared/components/C_Modal", () => ({ CustomisedModal: () => null }));

import MonthlyAttendanceExceptions from "./MonthlyAttendanceExceptions";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

describe("MonthlyAttendanceExceptions WFH conflict action", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.setItem("codeji.attendance.monthly-exceptions-expanded", "true");
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    mocks.getRequest.mockResolvedValue({ data: { methodResults: [] } });
    mocks.postRequest.mockImplementation(async (url: string) => url.endsWith("/search") ? ({ data: { methodResults: [{
      id: "exception-1", userId: "user-1", employeeId: "EMP-1", employeeName: "Employee One",
      exceptionType: "LEAVE_ATTENDANCE_CONFLICT", affectedDates: ["2026-10-26T00:00:00Z"],
      status: "PENDING_REVIEW", version: 4, leaveRequestId: "leave-1", workFromHomeRequestId: "wfh-1",
      reason: "Approved leave conflicts with approved WFH attendance.", lhdCount: 0, edCount: 0,
      combinedOccurrenceCount: 0, exceededOccurrenceCount: 0,
    }], totalRecords: 1 } }) : ({ data: { success: true } }));
    mocks.patchRequest.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    window.localStorage.removeItem("codeji.attendance.monthly-exceptions-expanded");
  });

  it("requires a reason and submits the supported keep-WFH decision with the exception version", async () => {
    await act(async () => root.render(<MonthlyAttendanceExceptions month={dayjs("2026-10-01")} />));
    const resolveButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Resolve");
    expect(resolveButton).toBeTruthy();
    await act(async () => resolveButton!.click());
    expect(container.textContent).toContain("Withdraw leave and keep WFH");
    const textarea = container.querySelector("textarea");
    expect(textarea).toBeTruthy();
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
      setter?.call(textarea, "Keep approved WFH and withdraw the conflicting leave request");
      textarea!.dispatchEvent(new Event("input", { bubbles: true }));
      textarea!.dispatchEvent(new Event("change", { bubbles: true }));
    });
    const submit = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes("Withdraw leave and keep WFH"));
    expect(submit?.disabled).toBe(false);
    await act(async () => submit!.click());
    expect(mocks.patchRequest).toHaveBeenCalledWith("api/wfh/attendance-exceptions/exception-1/resolve-conflict", {
      resolution: "KEEP_WFH_CANCEL_LEAVE",
      remarks: "Keep approved WFH and withdraw the conflicting leave request",
      exceptionVersion: 4,
    });
    expect(mocks.toastSuccess).toHaveBeenCalled();
  });

  it("can select keep-leave and cancel the linked WFH request", async () => {
    await act(async () => root.render(<MonthlyAttendanceExceptions month={dayjs("2026-10-01")} />));
    const resolveButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Resolve");
    await act(async () => resolveButton!.click());
    const keepLeaveButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Keep leave, cancel WFH");
    await act(async () => keepLeaveButton!.click());
    expect(container.textContent).toContain("cancels each full linked multi-day WFH request");

    const textarea = container.querySelector("textarea");
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
      setter?.call(textarea, "Preserve approved leave and cancel the linked WFH request");
      textarea!.dispatchEvent(new Event("input", { bubbles: true }));
      textarea!.dispatchEvent(new Event("change", { bubbles: true }));
    });
    const submit = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes("Keep leave and cancel linked WFH"));
    await act(async () => submit!.click());
    expect(mocks.patchRequest).toHaveBeenCalledWith("api/wfh/attendance-exceptions/exception-1/resolve-conflict", {
      resolution: "KEEP_LEAVE_CANCEL_WFH",
      remarks: "Preserve approved leave and cancel the linked WFH request",
      exceptionVersion: 4,
    });
  });
});
