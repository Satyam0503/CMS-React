import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TaxDeclarationReviewQueue from "./TaxDeclarationReviewQueue";

const mocks = vi.hoisted(() => ({
  load: vi.fn(),
  review: vi.fn(),
  userData: { userId: "reviewer-1", roleType: 2 as number, modulePermission: ["PayRoll.View", "PayRoll.Approve"] as string[] },
}));

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("../services", () => ({
  getCompanyTaxDeclarations: mocks.load,
  reviewEmployeeTaxDeclaration: mocks.review,
}));
vi.mock("../../../Redux/hooks", () => ({
  useAppSelector: (selector: (state: { user: { userData: typeof mocks.userData } }) => unknown) =>
    selector({ user: { userData: mocks.userData } }),
}));
vi.mock("react-toastify", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const item = {
  id: "declaration-1", companyId: "company-1", employeeId: "EMP-10", financialYear: "2026-27",
  regime: "OLD_REGIME", status: "SUBMITTED", version: 1,
  previousEmployerGrossSalary: 0, previousEmployerTds: 0, previousEmployerPf: 0, previousEmployerPt: 0,
  otherIncomeSavingsInterest: 0, otherIncomeOther: 0, declaredSection80C: 80000, declaredSection80Ccd1B: 0,
  declaredSection80D: 0, declaredSection24HomeLoanInterest: 0, declaredHraRentPaid: 120000, declaredSection80E: 0,
  declaredOtherDeductions: 0, approvedSection80C: 0, approvedSection80Ccd1B: 0, approvedSection80D: 0,
  approvedSection24HomeLoanInterest: 0, approvedHraExemption: 0, approvedSection80E: 0, approvedOtherDeductions: 0,
  isMetroCity: false, proofAttachments: [], submittedBy: "employee-1",
};

describe("TaxDeclarationReviewQueue", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.userData = { userId: "reviewer-1", roleType: 2, modulePermission: ["PayRoll.View", "PayRoll.Approve"] };
    mocks.load.mockResolvedValue({ data: { success: true, methodResult: [item] } });
    mocks.review.mockResolvedValue({ data: { success: true, methodResult: item } });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it("loads a tenant review queue and sends an approval action", async () => {
    await act(async () => root.render(<TaxDeclarationReviewQueue />));
    await vi.waitFor(() => expect(container.textContent).toContain("EMP-10"));
    await act(async () => {
      Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Review")?.click();
    });
    expect(document.body.textContent).toContain("Review tax declaration");
    await act(async () => {
      Array.from(document.body.querySelectorAll("button")).find((button) => button.textContent === "Approve declaration")?.click();
    });
    await vi.waitFor(() => expect(mocks.review).toHaveBeenCalledWith("declaration-1", expect.objectContaining({ decision: "APPROVE" })));
    expect(mocks.load).toHaveBeenCalledWith(expect.any(String), "SUBMITTED");
  });

  it("does not fetch company declarations for an employee role", async () => {
    mocks.userData = { userId: "employee-1", roleType: 3, modulePermission: ["PayRoll.View"] };
    await act(async () => root.render(<TaxDeclarationReviewQueue />));
    expect(container.textContent).toContain("Only HR, HR Executive, and administrators");
    expect(mocks.load).not.toHaveBeenCalled();
  });

  it("handles proof attachment verification and itemized deduction approvals", async () => {
    const itemWithProof = {
      ...item,
      id: "declaration-2",
      proofAttachments: [
        { id: "proof-1", section: "Section80C", documentName: "lic_receipt.pdf", documentUrl: "https://example.com/lic.pdf", amount: 50000, isVerified: false },
        { id: "proof-2", section: "HRA", documentName: "rent_agreement.pdf", documentUrl: "https://example.com/rent.pdf", amount: 120000, isVerified: true },
      ],
    };
    mocks.load.mockResolvedValue({ data: { success: true, methodResult: [itemWithProof] } });
    await act(async () => root.render(<TaxDeclarationReviewQueue />));
    await vi.waitFor(() => expect(container.textContent).toContain("EMP-10"));

    await act(async () => {
      Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Review")?.click();
    });

    expect(document.body.textContent).toContain("Proof documents (2)");
    expect(document.body.textContent).toContain("lic_receipt.pdf");
    expect(document.body.textContent).toContain("rent_agreement.pdf");
    expect(document.body.textContent).toContain("Total approved deductions:");

    // Verify proof-1 checkbox can be toggled
    const checkboxes = Array.from(document.body.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));
    expect(checkboxes.length).toBeGreaterThanOrEqual(2);
    await act(async () => {
      checkboxes[0].click();
    });

    await act(async () => {
      Array.from(document.body.querySelectorAll("button")).find((button) => button.textContent === "Approve declaration")?.click();
    });

    await vi.waitFor(() => {
      expect(mocks.review).toHaveBeenCalledWith("declaration-2", expect.objectContaining({
        decision: "APPROVE",
        approvedSection80C: 80000,
        approvedHraExemption: 120000,
        verifiedAttachmentIds: expect.arrayContaining(["proof-1", "proof-2"]),
      }));
    });
  });
});
