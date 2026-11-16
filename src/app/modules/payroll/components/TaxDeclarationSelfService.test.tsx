import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TaxDeclarationSelfService from "./TaxDeclarationSelfService";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const { getDeclaration, submitDeclaration } = vi.hoisted(() => ({
  getDeclaration: vi.fn(),
  submitDeclaration: vi.fn(),
}));

vi.mock("../services", () => ({
  getEmployeeTaxDeclaration: getDeclaration,
  submitEmployeeTaxDeclaration: submitDeclaration,
}));
vi.mock("../../../Redux/hooks", () => ({
  useAppSelector: (selector: (state: { user: { userData: { userId: string } } }) => unknown) =>
    selector({ user: { userData: { userId: "user-1" } } }),
}));
vi.mock("react-toastify", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

describe("TaxDeclarationSelfService", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    getDeclaration.mockResolvedValue({ data: { success: false, statusCode: 404, message: "No declaration" } });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it("loads the signed-in employee's declaration and submits the selected year", async () => {
    submitDeclaration.mockResolvedValue({
      data: { success: true, methodResult: { id: "decl-1", financialYear: "2026-27", status: "SUBMITTED", version: 1 } },
    });
    await act(async () => root.render(<TaxDeclarationSelfService />));
    await vi.waitFor(() => expect(getDeclaration).toHaveBeenCalled());
    const salaryInput = container.querySelector<HTMLInputElement>('input[type="number"]');
    expect(salaryInput).toBeTruthy();
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
      setter?.call(salaryInput, "125000");
      salaryInput?.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const form = container.querySelector("form");
    expect(form).toBeTruthy();
    await act(async () => form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));

    await vi.waitFor(() => expect(submitDeclaration).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ previousEmployerGrossSalary: 125000 }),
    ));
    expect(getDeclaration).toHaveBeenCalledWith("user-1", expect.any(String));
  });

  it("locks a pending declaration against another submission", async () => {
    getDeclaration.mockResolvedValue({ data: {
      success: true,
      methodResult: {
        id: "decl-2", companyId: "tenant-1", employeeId: "EMP1", financialYear: "2026-27",
        regime: "NEW_115BAC", status: "SUBMITTED", version: 1,
        previousEmployerGrossSalary: 0, previousEmployerTds: 0, previousEmployerPf: 0, previousEmployerPt: 0,
        otherIncomeSavingsInterest: 0, otherIncomeOther: 0, declaredSection80C: 0, declaredSection80Ccd1B: 0,
        declaredSection80D: 0, declaredSection24HomeLoanInterest: 0, declaredHraRentPaid: 0, declaredSection80E: 0,
        declaredOtherDeductions: 0, approvedSection80C: 0, approvedSection80Ccd1B: 0, approvedSection80D: 0,
        approvedSection24HomeLoanInterest: 0, approvedHraExemption: 0, approvedSection80E: 0, approvedOtherDeductions: 0,
        isMetroCity: false, proofAttachments: [],
      },
    } });
    await act(async () => root.render(<TaxDeclarationSelfService />));
    await vi.waitFor(() => expect(container.textContent).toContain("SUBMITTED · v1"));
    const submit = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes("Submit declaration"));
    expect(submit?.disabled).toBe(true);
    expect(submitDeclaration).not.toHaveBeenCalled();
  });

  it("creates a new version when the employee elects to revise an approved declaration", async () => {
    getDeclaration.mockResolvedValue({ data: {
      success: true,
      methodResult: {
        id: "approved-1", companyId: "tenant-1", employeeId: "EMP1", financialYear: "2026-27",
        regime: "OLD_REGIME", status: "APPROVED", version: 1, previousEmployerGrossSalary: 0,
        previousEmployerTds: 0, previousEmployerPf: 0, previousEmployerPt: 0, otherIncomeSavingsInterest: 0,
        otherIncomeOther: 0, declaredSection80C: 25000, declaredSection80Ccd1B: 0, declaredSection80D: 0,
        declaredSection24HomeLoanInterest: 0, declaredHraRentPaid: 0, declaredSection80E: 0, declaredOtherDeductions: 0,
        approvedSection80C: 25000, approvedSection80Ccd1B: 0, approvedSection80D: 0,
        approvedSection24HomeLoanInterest: 0, approvedHraExemption: 0, approvedSection80E: 0,
        approvedOtherDeductions: 0, isMetroCity: false, proofAttachments: [],
      },
    } });
    submitDeclaration.mockResolvedValue({ data: {
      success: true,
      methodResult: { id: "submitted-2", financialYear: "2026-27", regime: "OLD_REGIME", status: "SUBMITTED", version: 2 },
    } });
    await act(async () => root.render(<TaxDeclarationSelfService />));
    await vi.waitFor(() => expect(container.textContent).toContain("APPROVED · v1"));
    await act(async () => {
      Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Revise declaration")?.click();
    });
    expect(container.querySelector<HTMLInputElement>('input[type="number"]')?.disabled).toBe(false);
    await act(async () => {
      Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Submit new version")?.click();
    });
    await vi.waitFor(() => expect(submitDeclaration).toHaveBeenCalledWith("user-1", expect.objectContaining({ financialYear: "2026-27" })));
  });
});
