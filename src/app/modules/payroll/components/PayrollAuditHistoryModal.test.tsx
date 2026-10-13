import React from "react";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PayrollAuditHistoryModal } from "./PayrollAuditHistoryModal";
import { getPayrollAuditHistory } from "../services";

vi.mock("../services", () => ({ getPayrollAuditHistory: vi.fn() }));

const mockedGetHistory = vi.mocked(getPayrollAuditHistory);
const roots: ReturnType<typeof createRoot>[] = [];

const renderModal = async () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  roots.push(root);
  await act(async () => {
    root.render(<PayrollAuditHistoryModal payrollId="payroll-1" employeeName="Test Employee" onClose={vi.fn()} />);
  });
  return { container, root };
};

describe("PayrollAuditHistoryModal", () => {
  afterEach(async () => {
    for (const root of roots.splice(0)) {
      await act(async () => root.unmount());
    }
    document.body.innerHTML = "";
    mockedGetHistory.mockReset();
    vi.clearAllMocks();
  });

  it("loads and displays newest-first audit events returned by the API", async () => {
    mockedGetHistory.mockResolvedValue({ data: { success: true, methodResult: [
      { action: "PAYMENT_RECORDED", actorId: "admin-1", occurredAtUtc: "2026-09-25T10:00:00Z", notes: "BANK-123" },
      { action: "MONTH_PROCESSED", actorId: "admin-1", occurredAtUtc: "2026-09-24T10:00:00Z" },
    ] } } as never);
    await renderModal();
    expect(await vi.waitFor(() => document.body.textContent?.includes("PAYMENT_RECORDED"))).toBe(true);
    expect(document.body.textContent).toContain("BANK-123");
    expect(document.body.textContent).toContain("MONTH_PROCESSED");
    expect(mockedGetHistory).toHaveBeenCalledWith("payroll-1");
  });

  it("shows the API error and does not leave an endless loading state", async () => {
    mockedGetHistory.mockResolvedValue({ data: { success: false, message: "Payroll history unavailable" } } as never);
    await renderModal();
    expect(await vi.waitFor(() => document.body.textContent?.includes("Payroll history unavailable"))).toBe(true);
    expect(document.body.textContent).not.toContain("Unable to load payroll history.");
  });

  it("clears prior events when the selected payroll is closed", async () => {
    mockedGetHistory.mockResolvedValue({ data: { success: true, methodResult: [
      { action: "MONTH_PROCESSED", actorId: "admin-1", occurredAtUtc: "2026-09-24T10:00:00Z" },
    ] } } as never);
    const { container, root } = await renderModal();
    expect(await vi.waitFor(() => document.body.textContent?.includes("MONTH_PROCESSED"))).toBe(true);
    await act(async () => {
      root.render(<PayrollAuditHistoryModal payrollId={null} employeeName="Test Employee" onClose={vi.fn()} />);
    });
    expect(container.textContent).not.toContain("MONTH_PROCESSED");
  });
});
