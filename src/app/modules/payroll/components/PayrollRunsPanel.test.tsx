import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PayrollRunsPanel } from "./PayrollRunsPanel";
import * as payrollServices from "../services";

vi.mock("../services", () => ({
  approvePayrollRun: vi.fn(), calculatePayrollRun: vi.fn(), cancelPayrollRun: vi.fn(), createPayrollAdjustment: vi.fn(), createPaymentBatch: vi.fn(), createPayrollRun: vi.fn(),
  getPayrollRegister: vi.fn(), getPayrollRegisterCsv: vi.fn(), getPayrollReportSummary: vi.fn(), getPaymentBatch: vi.fn(), getPayrollRuns: vi.fn(),
  getPayrollAdjustments: vi.fn(), getPayrollAdjustmentComponents: vi.fn(), approvePayrollAdjustment: vi.fn(), rejectPayrollAdjustment: vi.fn(), getPayrollRunEmployees: vi.fn(), getPayrollRunReview: vi.fn(), processPayrollRun: vi.fn(), reconcilePaymentBatch: vi.fn(), recordPayrollRunReview: vi.fn(),
  submitPaymentBatch: vi.fn(), getPayrollStatutoryRegister: vi.fn(), getPayrollStatutoryRegisterCsv: vi.fn(),
}));
vi.mock("../../employees/employeeServices", () => ({ getAllEmployees: vi.fn() }));

const empty = { data: { success: true, methodResult: [] } };
const run = { id: "run-1", companyId: "company-1", periodStart: "2026-09-01", periodEnd: "2026-09-30", payDate: "2026-10-05", runType: "REGULAR", status: "CALCULATED", populationType: "ALL_ELIGIBLE", employeeCount: 1, readyCount: 1, blockedCount: 0, skippedCount: 0, grossTotal: 5000, deductionTotal: 0, netTotal: 5000, createdAtUtc: "2026-09-30T00:00:00Z" };
let root: Root | undefined;

const mount = async (canEdit = true, canApprove = true) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => { root?.render(<PayrollRunsPanel canEdit={canEdit} canApprove={canApprove} canCreate canSelectEmployees />); });
  return container;
};

describe("PayrollRunsPanel workflow", () => {
  beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    vi.mocked(payrollServices.getPayrollRuns).mockResolvedValue({ data: [run] } as never);
    vi.mocked(payrollServices.getPayrollAdjustments).mockResolvedValue({ data: { success: true, methodResult: [] } } as never);
    vi.mocked(payrollServices.rejectPayrollAdjustment).mockResolvedValue({ data: { success: true } } as never);
    vi.mocked(payrollServices.getPayrollAdjustmentComponents).mockResolvedValue({ data: { success: true, methodResult: [{ code: "BONUS", name: "Bonus", kind: "EARNING", isTaxable: true, version: 2 }] } } as never);
    vi.mocked(payrollServices.getPayrollRunEmployees).mockResolvedValue({ data: { success: true, methodResult: [{ employeeId: "employee-1", status: "CALCULATED" }] } } as never);
    vi.mocked(payrollServices.getPayrollRunReview).mockResolvedValue({ data: { success: true, methodResult: { runId: run.id, status: "CALCULATED", employeeCount: 1, calculatedCount: 1, blockedCount: 0, skippedCount: 0, grossTotal: 5000, deductionTotal: 0, netTotal: 5000, isReviewed: false, canApprove: true, blockingEmployeeIds: [] } } } as never);
    vi.mocked(payrollServices.getPayrollReportSummary).mockResolvedValue({ data: { success: true, methodResult: { runCount: 0, employeeCount: 0, grossTotal: 0, deductionTotal: 0, netTotal: 0 } } } as never);
    vi.mocked(payrollServices.getPayrollRegister).mockResolvedValue(empty as never);
    vi.mocked(payrollServices.getPayrollStatutoryRegister).mockResolvedValue(empty as never);
    vi.mocked(payrollServices.getPaymentBatch).mockRejectedValue(new Error("No batch"));
    vi.mocked(payrollServices.recordPayrollRunReview).mockResolvedValue({ data: { success: true } } as never);
    vi.mocked(payrollServices.cancelPayrollRun).mockResolvedValue({ data: { success: true } } as never);
    vi.mocked(payrollServices.approvePayrollRun).mockResolvedValue({ data: { success: true } } as never);
    vi.mocked(payrollServices.processPayrollRun).mockResolvedValue({ data: { success: true } } as never);
  });
  afterEach(async () => {
    if (root) await act(async () => root?.unmount());
    root = undefined;
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });
  it("shows employee-specific blockers when reviewing a blocked payroll run", async () => {
    const blockedRun = { ...run, status: "BLOCKED", blockedCount: 1, readyCount: 0 };
    vi.mocked(payrollServices.getPayrollRuns).mockResolvedValue({ data: [blockedRun] } as never);
    vi.mocked(payrollServices.getPayrollRunEmployees).mockResolvedValue({ data: { success: true, methodResult: [{
      employeeId: "EMP004", status: "BLOCKED", errorCode: "PAYROLL_EMPLOYEE_SALARY_MISSING",
      errorMessage: "No approved employee-specific salary revision is frozen for this employee. A pay group or salary template alone is not payable; create and approve the employee salary before retrying.",
    }] } } as never);

    const container = await mount();

    await vi.waitFor(() => expect(container.textContent).toContain("Review issues"));
    await act(async () => { Array.from(container.querySelectorAll("button")).find(button => button.textContent?.trim() === "Review issues")?.click(); });

    await vi.waitFor(() => expect(document.body.textContent).toContain("EMP004"));
    expect(document.body.textContent).toContain("A pay group or salary template alone is not payable");
    expect(payrollServices.getPayrollRunEmployees).toHaveBeenCalledWith("run-1");
  });



  it("makes skipped payroll employees reviewable even when the run is calculated", async () => {
    const calculatedRun = { ...run, status: "CALCULATED", skippedCount: 1 };
    vi.mocked(payrollServices.getPayrollRuns).mockResolvedValue({ data: [calculatedRun] } as never);
    vi.mocked(payrollServices.getPayrollRunEmployees).mockResolvedValue({ data: { success: true, methodResult: [{
      employeeId: "EMP009", status: "SKIPPED", exclusionReason: "No approved salary revision was available for the payroll period.",
    }] } } as never);
    const container = await mount();
    await vi.waitFor(() => expect(container.textContent).toContain("Review issues"));
    await act(async () => { Array.from(container.querySelectorAll("button")).find(button => button.textContent?.trim() === "Review issues")?.click(); });
    await vi.waitFor(() => expect(document.body.textContent).toContain("EMP009"));
    expect(document.body.textContent).toContain("No approved salary revision was available");
  });

  it("records a review, exposes approval only after review, then processes the approved run", async () => {
    let status = "CALCULATED";
    let reviewRecorded = false;
    vi.mocked(payrollServices.getPayrollRuns).mockImplementation(async () => ({ data: [{ ...run, status }] }) as never);
    vi.mocked(payrollServices.getPayrollRunReview).mockImplementation(async () => ({ data: { success: true, methodResult: { runId: run.id, status: "CALCULATED", employeeCount: 1, calculatedCount: 1, blockedCount: 0, skippedCount: 0, grossTotal: 5000, deductionTotal: 0, netTotal: 5000, isReviewed: reviewRecorded, canApprove: true, blockingEmployeeIds: [] } } }) as never);
    vi.mocked(payrollServices.recordPayrollRunReview).mockImplementation(async () => { reviewRecorded = true; return { data: { success: true } } as never; });
    vi.mocked(payrollServices.approvePayrollRun).mockImplementation(async () => { status = "APPROVED"; return { data: { success: true } } as never; });
    const container = await mount();
    await vi.waitFor(() => expect(container.textContent).toContain("Record review"));
    expect(Array.from(container.querySelectorAll("button")).some(button => button.textContent?.trim() === "Approve")).toBe(false);
    await act(async () => { Array.from(container.querySelectorAll("button")).find(button => button.textContent?.includes("Record review"))?.click(); });
    await vi.waitFor(() => expect(payrollServices.recordPayrollRunReview).toHaveBeenCalledWith("run-1", expect.any(String)));
    await vi.waitFor(() => expect(container.textContent).toContain("Approve"));
    await act(async () => { Array.from(container.querySelectorAll("button")).find(button => button.textContent === "Approve")?.click(); });
    await vi.waitFor(() => expect(container.textContent).toContain("Process"));
    await act(async () => { Array.from(container.querySelectorAll("button")).find(button => button.textContent === "Process")?.click(); });
    await vi.waitFor(() => expect(payrollServices.processPayrollRun).toHaveBeenCalledWith("run-1"));
  });

  it("requires explicit confirmation and an audit note before payment reconciliation", async () => {
    const processedRun = { ...run, status: "PROCESSED" };
    vi.mocked(payrollServices.getPayrollRuns).mockResolvedValue({ data: [processedRun] } as never);
    vi.mocked(payrollServices.getPaymentBatch).mockResolvedValue({ data: { id: "batch-1", payrollRunId: "run-1", status: "SUBMITTED", providerReference: "BANK-123", employeeCount: 1, totalNetAmount: 5000 } } as never);
    const container = await mount();
    await vi.waitFor(() => expect(container.textContent).toContain("Reconcile payment"));
    await act(async () => { Array.from(container.querySelectorAll("button")).find(button => button.textContent?.includes("Reconcile payment"))?.click(); });
    const reconcile = Array.from(document.body.querySelectorAll("button")).find(button => button.textContent?.includes("Confirm reconciliation")) as HTMLButtonElement;
    expect(reconcile.disabled).toBe(true);
    const note = Array.from(document.body.querySelectorAll("textarea")).find(input => input.getAttribute("name") || input.parentElement?.textContent?.includes("Reconciliation note"));
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
      setter?.call(note, "Bank statement verified");
      note?.dispatchEvent(new Event("input", { bubbles: true }));
      note?.dispatchEvent(new Event("change", { bubbles: true }));
    });
    const confirm = Array.from(document.body.querySelectorAll("input[type=checkbox]"))[0] as HTMLInputElement;
    await act(async () => { confirm.click(); });
    expect(reconcile.disabled).toBe(false);
    await act(async () => { reconcile.click(); });
    await vi.waitFor(() => expect(payrollServices.reconcilePaymentBatch).toHaveBeenCalledWith("batch-1", "Bank statement verified", true));
  });

  it("offers confirmed resume for an interrupted reconciliation using its saved note", async () => {
    const processedRun = { ...run, status: "PROCESSED" };
    vi.mocked(payrollServices.getPayrollRuns).mockResolvedValue({ data: [processedRun] } as never);
    vi.mocked(payrollServices.getPaymentBatch).mockResolvedValue({ data: { id: "batch-1", payrollRunId: "run-1", status: "RECONCILING", providerReference: "BANK-123", reconciliationNote: "Bank statement verified", employeeCount: 1, totalNetAmount: 5000 } } as never);
    const container = await mount();
    await vi.waitFor(() => expect(container.textContent).toContain("Resume reconciliation"));
    await act(async () => { Array.from(container.querySelectorAll("button")).find(button => button.textContent?.includes("Resume reconciliation"))?.click(); });
    expect(document.body.textContent).toContain("does not submit another payment");
    const resume = Array.from(document.body.querySelectorAll(".MuiDialog-root button")).find(button => button.textContent?.includes("Resume reconciliation")) as HTMLButtonElement;
    expect(resume.disabled).toBe(true);
    const confirm = Array.from(document.body.querySelectorAll("input[type=checkbox]"))[0] as HTMLInputElement;
    await act(async () => { confirm.click(); });
    expect(resume.disabled).toBe(false);
    await act(async () => { resume.click(); });
    await vi.waitFor(() => expect(payrollServices.reconcilePaymentBatch).toHaveBeenCalledWith("batch-1", "Bank statement verified", true));
  });

  it("does not expose payroll mutation actions without edit permission", async () => {
    const container = await mount(false, false);
    await vi.waitFor(() => expect(container.textContent).toContain("CALCULATED"));
    const visibleButtons = Array.from(container.querySelectorAll('[role="tabpanel"]:not([hidden]) button')).map(button => button.textContent?.trim());
    expect(visibleButtons).not.toContain("Record review");
    expect(visibleButtons).not.toContain("Approve");
    expect(visibleButtons).not.toContain("Process");
  });

  it("keeps final payroll approval available to an authorized admin after review", async () => {
    vi.mocked(payrollServices.getPayrollRunReview).mockResolvedValue({ data: { success: true, methodResult: { runId: run.id, status: "CALCULATED", employeeCount: 1, calculatedCount: 1, blockedCount: 0, skippedCount: 0, grossTotal: 5000, deductionTotal: 0, netTotal: 5000, isReviewed: true, canApprove: true, blockingEmployeeIds: [] } } } as never);
    const container = await mount(false, true);

    await vi.waitFor(() => expect(container.textContent).toContain("Approve"));
    expect(Array.from(container.querySelectorAll("button")).some(button => button.textContent?.trim() === "Approve")).toBe(true);
    expect(container.textContent).not.toContain("Calculate preview");
  });

  it("shows tenant adjustment drafts to reviewers and refreshes after approval", async () => {
    vi.mocked(payrollServices.getPayrollAdjustments).mockResolvedValue({ data: { success: true, methodResult: [{ id: "adjustment-1", originalPayrollRunId: "run-old", employeeId: "employee-1", type: "ARREARS", status: "DRAFT", amount: 1250, reason: "Approved overtime correction", createdAtUtc: "2026-09-30T00:00:00Z" }] } } as never);
    vi.mocked(payrollServices.approvePayrollAdjustment).mockResolvedValue({ data: { success: true } } as never);
    const container = await mount();
    await vi.waitFor(() => expect(container.textContent).toContain("Approved overtime correction"));
    const adjustmentTab = Array.from(container.querySelectorAll('[role="tab"]')).find(button => button.textContent?.includes("Adjustments"));
    await act(async () => { (adjustmentTab as HTMLElement)?.click(); });
    expect(container.textContent).toContain("Approval does not apply or pay an adjustment.");
    expect(container.textContent).toContain("Approved requests are not added to gross-to-net");
    const approve = Array.from(container.querySelectorAll("button")).find(button => button.textContent?.includes("Approve adjustment"));
    expect(approve).toBeTruthy();
    await act(async () => { approve?.click(); });
    await vi.waitFor(() => expect(payrollServices.approvePayrollAdjustment).toHaveBeenCalledWith("adjustment-1"));
  });

  it("loads adjustment components for the paid run month before enabling draft entry", async () => {
    vi.mocked(payrollServices.getPayrollRuns).mockResolvedValue({ data: [{ ...run, status: "PAID" }] } as never);
    const container = await mount();
    await vi.waitFor(() => expect(container.textContent).toContain("Adjustment"));
    await act(async () => { Array.from(container.querySelectorAll("button")).find(button => button.textContent?.trim() === "Adjustment")?.click(); });

    await vi.waitFor(() => expect(payrollServices.getPayrollAdjustmentComponents).toHaveBeenCalledWith("2026-09-01"));
    expect(payrollServices.getPayrollRunEmployees).toHaveBeenCalledWith("run-1");
    expect(document.body.textContent).toContain("Target payroll month");
    expect(document.body.textContent).toContain("Salary component");
  });

  it("paginates adjustment history beyond the first page instead of hiding older requests", async () => {
    const manyAdjustments = Array.from({ length: 30 }, (_, index) => ({
      id: `adjustment-${index}`, originalPayrollRunId: "run-old", employeeId: `employee-${index}`,
      type: "ARREARS", status: "DRAFT", amount: 100, reason: `Correction ${index}`,
      createdAtUtc: "2026-09-30T00:00:00Z",
    }));
    vi.mocked(payrollServices.getPayrollAdjustments).mockResolvedValue({ data: { success: true, methodResult: manyAdjustments } } as never);
    const container = await mount();
    const tab = Array.from(container.querySelectorAll('[role="tab"]')).find(button => button.textContent?.includes("Adjustments"));
    await act(async () => { (tab as HTMLElement)?.click(); });

    const table = container.querySelector('[aria-label="Payroll adjustments"] tbody');
    expect(table?.textContent).toContain("employee-0");
    expect(table?.textContent).not.toContain("employee-25");
    const nextPage = container.querySelector<HTMLButtonElement>('button[aria-label="Go to next page"]');
    expect(nextPage).toBeTruthy();
    await act(async () => { nextPage?.click(); });

    expect(table?.textContent).toContain("employee-25");
    expect(table?.textContent).not.toContain("employee-0");
  });

  it("shows audit actors and effective timestamps for payroll adjustments", async () => {
    vi.mocked(payrollServices.getPayrollAdjustments).mockResolvedValue({ data: { success: true, methodResult: [{ id: "adjustment-audit", originalPayrollRunId: "run-old", employeeId: "employee-audit", type: "ARREARS", status: "APPROVED", amount: 1250, reason: "Approved correction", createdAtUtc: "2026-09-30T00:00:00Z", createdBy: "creator-1", approvedAtUtc: "2026-10-01T00:00:00Z", approvedBy: "approver-2" }] } } as never);
    const container = await mount();
    const tab = Array.from(container.querySelectorAll('[role="tab"]')).find(button => button.textContent?.includes("Adjustments"));
    await act(async () => { (tab as HTMLElement)?.click(); });

    expect(container.textContent).toContain("Audit history");
    expect(container.textContent).toContain("Created 30 Sep 2026 by creator-1");
    expect(container.textContent).toContain("Approved 01 Oct 2026 by approver-2");
  });

  it("does not expose adjustment approval to edit-only users", async () => {
    vi.mocked(payrollServices.getPayrollAdjustments).mockResolvedValue({ data: { success: true, methodResult: [{ id: "adjustment-1", originalPayrollRunId: "run-old", employeeId: "employee-1", type: "ARREARS", status: "DRAFT", amount: 1250, reason: "Approved overtime correction", createdAtUtc: "2026-09-30T00:00:00Z" }] } } as never);
    const container = await mount(true, false);
    const tab = Array.from(container.querySelectorAll('[role="tab"]')).find(button => button.textContent?.includes("Adjustments"));
    await act(async () => { (tab as HTMLElement)?.click(); });

    expect(Array.from(container.querySelectorAll("button")).some(button => button.textContent?.includes("Approve adjustment"))).toBe(false);
    expect(container.textContent).toContain("DRAFT");
  });

  it("shows adjustment approval to approve-only users", async () => {
    vi.mocked(payrollServices.getPayrollAdjustments).mockResolvedValue({ data: { success: true, methodResult: [{ id: "adjustment-1", originalPayrollRunId: "run-old", employeeId: "employee-1", type: "ARREARS", status: "DRAFT", amount: 1250, reason: "Approved overtime correction", createdAtUtc: "2026-09-30T00:00:00Z" }] } } as never);
    const container = await mount(false, true);
    const tab = Array.from(container.querySelectorAll('[role="tab"]')).find(button => button.textContent?.includes("Adjustments"));
    await act(async () => { (tab as HTMLElement)?.click(); });

    expect(Array.from(container.querySelectorAll("button")).some(button => button.textContent?.includes("Approve adjustment"))).toBe(true);
  });

  it("requires an Admin rejection reason and sends the audited decision", async () => {
    let status = "DRAFT";
    vi.mocked(payrollServices.getPayrollAdjustments).mockImplementation(async () => ({ data: { success: true, methodResult: [{
      id: "adjustment-reject", originalPayrollRunId: "run-old", employeeId: "employee-1", type: "ARREARS",
      status, amount: 1250, reason: "Approved overtime correction", createdAtUtc: "2026-09-30T00:00:00Z",
      rejectedBy: status === "REJECTED" ? "admin-1" : undefined, rejectedAtUtc: status === "REJECTED" ? "2026-10-01T00:00:00Z" : undefined,
      rejectionReason: status === "REJECTED" ? "Duplicate request" : undefined,
    }] } }) as never);
    vi.mocked(payrollServices.rejectPayrollAdjustment).mockImplementation(async () => {
      status = "REJECTED";
      return { data: { success: true } } as never;
    });
    const container = await mount(false, true);
    const tab = Array.from(container.querySelectorAll('[role="tab"]')).find(button => button.textContent?.includes("Adjustments"));
    await act(async () => { (tab as HTMLElement)?.click(); });
    const reject = Array.from(container.querySelectorAll("button")).find(button => button.textContent?.trim() === "Reject");
    expect(reject).toBeTruthy();
    await act(async () => { reject?.click(); });
    const submit = Array.from(document.body.querySelectorAll("button")).find(button => button.textContent?.trim() === "Reject request") as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    const reason = document.body.querySelector("textarea") as HTMLTextAreaElement;
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
      setter?.call(reason, "Duplicate request");
      reason.dispatchEvent(new Event("input", { bubbles: true }));
      reason.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(submit.disabled).toBe(false);
    await act(async () => { submit.click(); });
    await vi.waitFor(() => expect(payrollServices.rejectPayrollAdjustment).toHaveBeenCalledWith("adjustment-reject", "Duplicate request"));
    await vi.waitFor(() => expect(container.textContent).toContain("Rejected 01 Oct 2026 by admin-1: Duplicate request"));
  });

  it("offers a blocked-run calculation retry using the persisted run snapshots", async () => {
    vi.mocked(payrollServices.getPayrollRuns).mockResolvedValue({ data: [{ ...run, status: "BLOCKED" }] } as never);
    vi.mocked(payrollServices.calculatePayrollRun).mockResolvedValue({ data: { success: true } } as never);
    const container = await mount();
    await vi.waitFor(() => expect(container.textContent).toContain("Retry calculation"));
    const retry = Array.from(container.querySelectorAll("button")).find(button => button.textContent?.includes("Retry calculation"));
    await act(async () => { retry?.click(); });
    await vi.waitFor(() => expect(payrollServices.calculatePayrollRun).toHaveBeenCalledWith("run-1"));
  });

  it("requires an audit reason, cancels a blocked run, and opens a fresh replacement form", async () => {
    vi.mocked(payrollServices.getPayrollRuns).mockResolvedValue({ data: [{ ...run, status: "BLOCKED" }] } as never);
    const container = await mount();
    await vi.waitFor(() => expect(container.textContent).toContain("Cancel & recreate"));
    await act(async () => { Array.from(container.querySelectorAll("button")).find(button => button.textContent?.includes("Cancel & recreate"))?.click(); });
    const submit = Array.from(document.body.querySelectorAll("button")).find(button => button.textContent === "Cancel run") as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    const reason = document.body.querySelector("textarea") as HTMLTextAreaElement;
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
      setter?.call(reason, "Formula configuration was corrected");
      reason.dispatchEvent(new Event("input", { bubbles: true }));
      reason.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(submit.disabled).toBe(false);
    await act(async () => { submit.click(); });
    await vi.waitFor(() => expect(payrollServices.cancelPayrollRun).toHaveBeenCalledWith("run-1", "Formula configuration was corrected"));
    await vi.waitFor(() => expect(document.body.textContent).toContain("Create payroll run"));
  });

  it("does not offer cancellation for a calculated run", async () => {
    const container = await mount();
    await vi.waitFor(() => expect(container.textContent).toContain("CALCULATED"));
    expect(container.textContent).not.toContain("Cancel & recreate");
  });

  it("renders compact run cards and scroll-contained payroll registers for narrow screens", async () => {
    const container = await mount();
    await vi.waitFor(() => expect(container.textContent).toContain("5,000"));
    expect(container.querySelector('[aria-label="Payroll runs, compact view"]')).toBeTruthy();
    expect(container.querySelectorAll(".MuiTableContainer-root")).toHaveLength(3);
    expect(container.querySelector('[aria-label="Payroll statutory register"]')).toBeTruthy();
  });

  it("summarizes current run statuses and only counts paid or closed net in the finalized total", async () => {
    vi.mocked(payrollServices.getPayrollRuns).mockResolvedValue({ data: [
      { ...run, status: "CALCULATED", netTotal: 5000 },
      { ...run, id: "run-blocked", status: "BLOCKED", netTotal: 2500 },
      { ...run, id: "run-paid", status: "PAID", netTotal: 7000 },
      { ...run, id: "run-closed", status: "CLOSED", netTotal: 2250 },
    ] } as never);
    const container = await mount();
    await vi.waitFor(() => expect(container.querySelector('[aria-label="Payroll run overview"]')).toBeTruthy());
    const overview = container.querySelector('[aria-label="Payroll run overview"]') as HTMLElement;
    expect(overview.textContent).toContain("Runs in view4");
    expect(overview.textContent).toContain("Calculated runs1");
    expect(overview.textContent).toContain("Blocked runs1");
    expect(overview.textContent).toContain("Paid / closed net9,250");
  });

  it("organizes runs, adjustments, and reporting in accessible workspace tabs", async () => {
    const container = await mount();
    await vi.waitFor(() => expect(container.querySelectorAll('[role="tabpanel"]')).toHaveLength(3));
    const tabs = Array.from(container.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
    expect(tabs.map((tab) => tab.textContent)).toEqual(["Payroll runs (1)", "Adjustments (0)", "Reports & statutory"]);
    const panels = Array.from(container.querySelectorAll('[role="tabpanel"]')) as HTMLElement[];
    expect(panels[0].hidden).toBe(false);
    expect(panels[1].hidden).toBe(true);
    await act(async () => { tabs[1].click(); });
    expect(panels[0].hidden).toBe(true);
    expect(panels[1].hidden).toBe(false);
    await act(async () => { tabs[2].click(); });
    expect(panels[2].hidden).toBe(false);
  });
});
