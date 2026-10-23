import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RecruitmentOfferApprovalPolicyEditor from "./RecruitmentOfferApprovalPolicyEditor";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const mockGetOfferPolicy = vi.fn();
const mockUpsertOfferPolicy = vi.fn();
const mockGetAllJobVacancies = vi.fn();
const mockGetAllDepartments = vi.fn();
const mockGetJobTitles = vi.fn();
const mockGetCompanyDetails = vi.fn();
const mockGetAllEmployees = vi.fn();

vi.mock("./services", () => ({
  getRecruitmentOfferApprovalPolicy: (...args: any[]) => mockGetOfferPolicy(...args),
  upsertRecruitmentOfferApprovalPolicy: (...args: any[]) => mockUpsertOfferPolicy(...args),
  getAllJobVacancies: (...args: any[]) => mockGetAllJobVacancies(...args),
}));

vi.mock("../admin/adminservices", () => ({
  getAllDepartments: (...args: any[]) => mockGetAllDepartments(...args),
  getJobTitles: (...args: any[]) => mockGetJobTitles(...args),
  getCompanyDetails: (...args: any[]) => mockGetCompanyDetails(...args),
}));

vi.mock("../employees/employeeServices", () => ({
  getAllEmployees: (...args: any[]) => mockGetAllEmployees(...args),
}));

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("../theme/useIsDark", () => ({
  useIsDark: () => false,
}));

const roots: Root[] = [];

describe("RecruitmentOfferApprovalPolicyEditor", () => {
  beforeEach(() => {
    mockGetOfferPolicy.mockResolvedValue({
      data: {
        success: true,
        methodResult: {
          policyId: "pol-101",
          currency: "INR",
          approvalThreshold: 1000000,
          requireApprovalReference: true,
          legalEntityId: "Codeji Global HQ",
          departmentId: "dept-eng",
          grade: "L4",
          delegatedApproverUserId: "usr-42",
          delegationExpiresAtUtc: "2028-12-31T23:59:00Z",
          version: 2,
        },
      },
    });

    mockUpsertOfferPolicy.mockResolvedValue({
      data: {
        success: true,
        methodResult: "pol-101",
        message: "Policy updated",
      },
    });

    mockGetAllJobVacancies.mockResolvedValue({
      data: {
        success: true,
        methodResults: [
          {
            jobId: "VAC-2026-ENG-01",
            title: "Senior Backend Engineer",
            department: "Engineering",
            location: "Remote",
            status: true,
          },
        ],
      },
    });

    mockGetAllDepartments.mockResolvedValue({
      data: {
        success: true,
        methodResults: [
          { departmentId: "dept-eng", titles: { en: "Engineering" }, isActive: true },
          { departmentId: "dept-hr", titles: { en: "Human Resources" }, isActive: true },
        ],
      },
    });

    mockGetJobTitles.mockResolvedValue({
      data: {
        success: true,
        methodResults: [
          { jobTitleId: "jt-01", titles: { en: "Staff Engineer" }, isActive: true },
        ],
      },
    });

    mockGetCompanyDetails.mockResolvedValue({
      data: {
        success: true,
        methodResult: { companyName: "Codeji Global HQ" },
      },
    });

    mockGetAllEmployees.mockResolvedValue({
      data: {
        success: true,
        methodResults: [
          {
            userId: "usr-42",
            employeeId: "EMP-042",
            fullName: "Sarah Connor",
            email: "sarah@codeji.com",
            department: "Engineering",
            jobRole: "Engineering Director",
          },
          {
            userId: "usr-99",
            employeeId: "EMP-099",
            fullName: "John Doe",
            email: "john@codeji.com",
            department: "HR",
            jobRole: "HR Head",
          },
        ],
      },
    });
  });

  afterEach(() => {
    while (roots.length > 0) {
      const root = roots.pop();
      act(() => root?.unmount());
    }
    vi.clearAllMocks();
  });

  function renderComponent() {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    return { root, container };
  }

  it("renders the Offer Approval Governance card with title, scope pills, and loaded policy", async () => {
    const { root, container } = renderComponent();

    await act(async () => {
      root.render(<RecruitmentOfferApprovalPolicyEditor />);
    });

    // Wait for async loads
    await act(async () => {
      await Promise.resolve();
    });

    expect(container.textContent).toContain("Offer Approval & Compensation Governance");
    expect(container.textContent).toContain("Company-wide Policy");
    expect(container.textContent).toContain("Vacancy-Specific Override");
    expect(container.textContent).toContain("Active Delegation");
    expect(container.textContent).toContain("Sarah Connor");
  });

  it("displays the plain-English governance simulation rule", async () => {
    const { root, container } = renderComponent();

    await act(async () => {
      root.render(<RecruitmentOfferApprovalPolicyEditor />);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(container.textContent).toContain("Active Governance Enforcement Rule");
    expect(container.textContent).toContain("Sarah Connor");
    expect(container.textContent).toContain("₹ 10,00,000");
  });

  it("switches to Vacancy-Specific Override mode and shows vacancy search input", async () => {
    const { root, container } = renderComponent();

    await act(async () => {
      root.render(<RecruitmentOfferApprovalPolicyEditor />);
    });

    await act(async () => {
      await Promise.resolve();
    });

    const vacancyChip = Array.from(container.querySelectorAll(".MuiChip-root")).find(
      (el) => el.textContent?.includes("Vacancy-Specific Override")
    );
    expect(vacancyChip).toBeDefined();

    await act(async () => {
      (vacancyChip as HTMLElement).click();
    });

    expect(container.textContent).toContain("Search Job Vacancy");
  });

  it("calls upsertRecruitmentOfferApprovalPolicy when Save policy button is clicked", async () => {
    const { root, container } = renderComponent();

    await act(async () => {
      root.render(<RecruitmentOfferApprovalPolicyEditor />);
    });

    await act(async () => {
      await Promise.resolve();
    });

    const saveButton = Array.from(container.querySelectorAll("button")).find(
      (btn) => btn.textContent?.includes("Save policy")
    );
    expect(saveButton).toBeDefined();

    await act(async () => {
      saveButton?.click();
    });

    expect(mockUpsertOfferPolicy).toHaveBeenCalledTimes(1);
    const payload = mockUpsertOfferPolicy.mock.calls[0][0];
    expect(payload.currency).toBe("INR");
    expect(payload.approvalThreshold).toBe(1000000);
    expect(payload.requireApprovalReference).toBe(true);
    expect(payload.delegatedApproverUserId).toBe("usr-42");
  });
});

