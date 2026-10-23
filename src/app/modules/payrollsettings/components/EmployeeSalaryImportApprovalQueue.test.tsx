import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { approveMock, pendingMock, submitMock, toastErrorMock, toastSuccessMock } = vi.hoisted(() => ({
  approveMock: vi.fn(), pendingMock: vi.fn(), submitMock: vi.fn(), toastErrorMock: vi.fn(), toastSuccessMock: vi.fn(),
}));
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("../../payroll/services", () => ({
  approveEmployeeSalaryStructure: approveMock,
  getEmployeeSalaryImportBatch: vi.fn(),
  getPendingEmployeeSalaryStructures: pendingMock,
  previewEmployeeSalaryImport: vi.fn(),
  previewEmployeeSalaryPdf: vi.fn(),
  submitEmployeeSalaryImport: vi.fn(),
  submitEmployeeSalaryStructure: submitMock,
}));
vi.mock("react-toastify", () => ({ toast: { error: toastErrorMock, success: toastSuccessMock } }));
vi.mock("@mui/icons-material", () => ({
  default: () => null,
  CloudUploadRounded: () => null,
  CheckCircleRounded: () => null,
  DownloadRounded: () => null,
  InsertDriveFileOutlined: () => null,
  DeleteOutlineRounded: () => null,
  TaskAltRounded: () => null,
}));
vi.mock("@mui/material", () => {
  const element = (tag: string) => ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => React.createElement(tag, props, children);
  return {
    Alert: element("div"),
    Box: element("div"),
    Button: element("button"),
    Chip: element("span"),
    CircularProgress: () => null,
    Divider: element("hr"),
    Stack: element("div"),
    Table: element("table"),
    TableBody: element("tbody"),
    TableCell: element("td"),
    TableContainer: element("div"),
    TableHead: element("thead"),
    TableRow: element("tr"),
    Typography: element("p"),
    alpha: (color: string) => color,
    useTheme: () => ({ palette: { mode: "light", primary: { main: "#0b5cab" } } }),
  };
});

import { EmployeeSalaryImportPanel } from "./EmployeeSalaryImportPanel";

const draft = {
  id: "salary-1", employeeId: "EMP-1", currency: "INR", paymentFrequency: "MONTHLY", effectiveFrom: "2026-10-01T00:00:00",
  status: "DRAFT", approvalStatus: "DRAFT", source: "IMPORT:batch-1", version: 1,
  components: [{ componentCode: "BASIC", componentName: "Basic", kind: "EARNING" as const, value: 50000, calculationType: "FIXED", isTaxable: true, isRecurring: true, isStatutory: false, isEmployerContribution: false }],
};

describe("EmployeeSalaryImportPanel approval queue", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    pendingMock.mockReset();
    submitMock.mockReset();
    approveMock.mockReset();
    toastErrorMock.mockReset();
    toastSuccessMock.mockReset();
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  async function render(canEdit: boolean, canApprove: boolean, pending: unknown[]) {
    pendingMock.mockResolvedValue({ data: pending });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => root.render(<EmployeeSalaryImportPanel canEdit={canEdit} canApprove={canApprove} />));
    await vi.waitFor(() => expect(pendingMock).toHaveBeenCalled());
  }

  it("lets an editor submit drafts but does not expose approval", async () => {
    await render(true, false, [draft]);

    expect(container.textContent).toContain("EMP-1");
    expect(Array.from(container.querySelectorAll("button")).some((button) => button.textContent === "Submit for approval")).toBe(true);
    expect(Array.from(container.querySelectorAll("button")).some((button) => button.textContent === "Approve")).toBe(false);

    submitMock.mockResolvedValue({ data: { success: true } });
    pendingMock.mockResolvedValue({ data: [{ ...draft, approvalStatus: "SUBMITTED", status: "PENDING_REVIEW" }] });
    const submit = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Submit for approval");
    await act(async () => submit?.click());
    expect(submitMock).toHaveBeenCalledWith("salary-1", 1);
    expect(toastSuccessMock).toHaveBeenCalled();
    expect(Array.from(container.querySelectorAll("button")).some((button) => button.textContent === "Approve")).toBe(false);
  });

  it("shows approval only to an approver for submitted structures", async () => {
    await render(false, true, [{ ...draft, approvalStatus: "SUBMITTED", status: "PENDING_REVIEW" }]);

    expect(container.textContent).not.toContain("view-only access");
    expect(Array.from(container.querySelectorAll("button")).some((button) => button.textContent === "Submit for approval")).toBe(false);
    const approve = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Approve");
    expect(approve).toBeDefined();
    approveMock.mockResolvedValue({ data: { success: true } });
    await act(async () => approve?.click());
    expect(approveMock).toHaveBeenCalledWith("salary-1", 1);
  });
});
