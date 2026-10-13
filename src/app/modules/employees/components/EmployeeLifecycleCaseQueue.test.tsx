import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EmployeeLifecycleCaseQueue } from "./EmployeeLifecycleCaseQueue";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const { mockCases, mockSummary } = vi.hoisted(() => ({
  mockCases: [
    {
      caseId: "LC-0001",
      employeeUserId: "emp-uuid-1234",
      employeeName: "Alice Wonderland",
      employeeId: "CD-0101",
      employeeJobRole: "fdad88bd-8cbb-4486-93d7-97e7436512a1", // raw GUID to test sanitization
      employeeDepartmentName: "Engineering",
      lifecycleStatus: "MaternityLeave",
      leaveTotalDays: 182,
      status: "Active",
      effectiveFromUtc: "2025-01-15T00:00:00Z",
      expectedReturnDate: "2025-07-15T00:00:00Z",
      documentsVerified: true,
      isReturnOverdue: false,
      evidence: [],
      events: [],
    },
  ],
  mockSummary: {
    total: 1,
    active: 1,
    pendingDocuments: 0,
    overdueReturns: 0,
    upcomingReturns: 1,
    byStatus: { Active: 1 },
  },
}));

vi.mock("../employeeServices", () => ({
  getEmployeeLifecycleCases: vi.fn().mockResolvedValue({ data: mockCases }),
  getEmployeeLifecycleCaseSummary: vi.fn().mockResolvedValue({ data: mockSummary }),
  updateEmployeeLifecycleCase: vi.fn().mockResolvedValue({ data: { ...mockCases[0], status: "Completed" } }),
  downloadEmployeeLifecycleCaseEvidence: vi.fn().mockResolvedValue({ data: new Blob() }),
  uploadEmployeeLifecycleCaseEvidence: vi.fn().mockResolvedValue({ data: mockCases[0] }),
  verifyEmployeeLifecycleCaseEvidence: vi.fn().mockResolvedValue({ data: mockCases[0] }),
}));

describe("EmployeeLifecycleCaseQueue", () => {
  afterEach(() => document.body.replaceChildren());

  it("renders lifecycle cases with sanitized role and profile link", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<EmployeeLifecycleCaseQueue />);
      await Promise.resolve();
      await Promise.resolve();
    });

    // Verify summary KPIs
    expect(container.textContent).toContain("Active Cases");
    expect(container.textContent).toContain("Pending Documents");

    // Verify employee information
    expect(container.textContent).toContain("Alice Wonderland");
    expect(container.textContent).toContain("CD-0101");
    // Raw GUID must NOT be displayed
    expect(container.textContent).not.toContain("fdad88bd-8cbb-4486-93d7-97e7436512a1");
    // Sanitized role fallback should be shown
    expect(container.textContent).toContain("Team Member");
    expect(container.textContent).toContain("Engineering");

    // Verify profile link
    const profileLink = container.querySelector('a[href="/employees/emp-uuid-1234/about"]');
    expect(profileLink).not.toBeNull();
    expect(profileLink?.getAttribute("href")).toBe("/employees/emp-uuid-1234/about");

    await act(async () => {
      root.unmount();
    });
  });

  it("opens modal with detailed workflow and profile button upon selection", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<EmployeeLifecycleCaseQueue />);
      await Promise.resolve();
      await Promise.resolve();
    });

    // Find and click on the "View Details" button
    const buttons = Array.from(container.querySelectorAll("button"));
    const viewDetailsBtn = buttons.find((b) => b.textContent?.includes("View Details"));
    expect(viewDetailsBtn).toBeDefined();

    await act(async () => {
      viewDetailsBtn?.click();
      await Promise.resolve();
      await Promise.resolve();
    });

    // Verify dialog contents in document.body
    expect(document.body.textContent).toContain("Lifecycle Case: LC-0001");
    expect(document.body.textContent).toContain("View Full Profile");
    expect(document.body.textContent).toContain("Workflow Stage Progression");
    expect(document.body.textContent).toContain("Status Transition Controls");
    expect(document.body.textContent).toContain("Extension Request");
    expect(document.body.textContent).toContain("Evidence Verification");

    await act(async () => {
      root.unmount();
    });
  });
});
