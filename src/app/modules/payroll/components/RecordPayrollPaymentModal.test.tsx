import React from "react";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RecordPayrollPaymentModal } from "./RecordPayrollPaymentModal";

const renderModal = async (onSubmit = vi.fn()) => {
  const container = document.createElement("div");
  const root = createRoot(container);
  await act(async () => { root.render(<RecordPayrollPaymentModal open employeeName="Test Employee" submitting={false} onClose={vi.fn()} onSubmit={onSubmit} />); });
  return { container, root, onSubmit };
};

describe("RecordPayrollPaymentModal", () => {
  afterEach(() => { document.body.innerHTML = ""; vi.clearAllMocks(); });

  it("keeps record payment disabled until a reference is provided", async () => {
    await renderModal();
    const button = Array.from(document.body.querySelectorAll("button")).find(item => item.textContent?.includes("Record payment")) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("submits the trimmed reference and selected method", async () => {
    const onSubmit = vi.fn();
    await renderModal(onSubmit);
    const inputs = Array.from(document.body.querySelectorAll("input"));
    const reference = inputs.find(input => input.getAttribute("aria-label")?.toLowerCase().includes("payment reference") || input.parentElement?.textContent?.includes("Payment reference")) ?? inputs.at(-1);
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
      setter?.call(reference, "  BANK-123  ");
      reference?.dispatchEvent(new Event("input", { bubbles: true }));
      reference?.dispatchEvent(new Event("change", { bubbles: true }));
    });
    const button = Array.from(document.body.querySelectorAll("button")).find(item => item.textContent?.includes("Record payment")) as HTMLButtonElement;
    await act(async () => { button.click(); });
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ paymentReference: "BANK-123", paymentMethod: "MANUAL", paymentDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) }));
  });

  it("disables payment controls while submission is in flight", async () => {
    const onSubmit = vi.fn();
    const container = document.createElement("div");
    const root = createRoot(container);
    await act(async () => {
      root.render(<RecordPayrollPaymentModal open employeeName="Test Employee" submitting onClose={vi.fn()} onSubmit={onSubmit} />);
    });
    const button = Array.from(document.body.querySelectorAll("button")).find(item => item.textContent?.includes("Saving")) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(Array.from(document.body.querySelectorAll("input")).every(input => input.disabled)).toBe(true);
    expect(onSubmit).not.toHaveBeenCalled();
  });});

