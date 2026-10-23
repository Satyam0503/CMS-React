import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import PayRollManagement from "./PayRollManagement";
import * as payrollServices from "./services";

vi.mock("./components/PayRollTable", () => ({
  PayRollTable: ({ payRollData }: { payRollData: any[] }) => (
    <div data-testid="payroll-table" data-count={payRollData?.length}>
      Monthly Register Table Content ({payRollData?.length ?? 0} rows)
    </div>
  ),
}));

vi.mock("./components/UploadPayRollData", () => ({
  UploadPayRollData: () => <div data-testid="upload-payroll-data" />,
}));

vi.mock("./services", () => ({
  getEmployeePayRollData: vi.fn(),
  generateMonthlyPayroll: vi.fn(),
  approvePayrollMonth: vi.fn(),
  processPayrollMonth: vi.fn(),
  recordPayrollPayment: vi.fn(),
  closePayrollMonth: vi.fn(),
  getPayrollAuditHistory: vi.fn(),
}));

vi.mock("../../Context/PageDataProvider", () => ({
  usePageData: () => ({ setPageTitle: vi.fn() }),
}));

vi.mock("react-intl", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-intl")>();
  return {
    ...actual,
    useIntl: () => ({
      formatMessage: ({ id, defaultMessage }: { id?: string; defaultMessage?: string }) => id || defaultMessage || "",
    }),
  };
});

vi.mock("../../Redux/hooks", () => ({
  useAppSelector: (selector: any) =>
    selector({
      user: {
        userData: {
          roleType: 1, // Administrator
          modulePermission: [
            "PayRoll.View",
            "PayRoll.Create",
            "PayRoll.Edit",
            "PayRoll.Approve",
            "PayrollSettings.View",
            "PayrollSettings.Create",
            "Employees.View",
          ],
        },
      },
    }),
}));

let root: Root | undefined;

const mount = async (initialEntries = ["/payroll"]) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root?.render(
      <MemoryRouter initialEntries={initialEntries}>
        <PayRollManagement />
      </MemoryRouter>
    );
  });
  return container;
};

describe("Streamlined PayRollManagement workflow", () => {
  beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    vi.mocked(payrollServices.getEmployeePayRollData).mockResolvedValue({
      data: { success: true, methodResults: [] },
    } as never);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount();
      });
      root = undefined;
    }
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("renders the streamlined single payroll view with table directly", async () => {
    const container = await mount();
    // Verify no confusing tabs are rendered
    expect(container.querySelector('[role="tablist"]')).toBeNull();
    // Verify the payroll table is rendered directly
    expect(container.querySelector('[data-testid="payroll-table"]')).not.toBeNull();
  });

  it("renders the Generate Payroll action button when the month has no calculated records", async () => {
    const container = await mount();
    const generateBtn = Array.from(container.querySelectorAll("button")).find((btn) =>
      btn.textContent?.includes("Generate") || btn.getAttribute("aria-label")?.includes("Generate")
    );
    expect(generateBtn).toBeDefined();
  });

  it("renders the upload payroll component and search input", async () => {
    const container = await mount();
    expect(container.querySelector('[data-testid="upload-payroll-data"]')).not.toBeNull();
    expect(container.querySelector('input[placeholder*="search" i], input[type="text"]')).not.toBeNull();
  });

  it("renders 'Calculate Remaining' button when some employees are processed and others are unprocessed", async () => {
    vi.mocked(payrollServices.getEmployeePayRollData).mockResolvedValueOnce({
      data: {
        success: true,
        methodResults: [
          {
            employeeId: "emp-1",
            employeeName: "Alice Smith",
            jobTitle: null,
            payData: {
              payRollId: "pay-1",
              employeeId: "emp-1",
              isProcessed: true,
              workflowStatus: "PROCESSED",
              paidDate: null as never,
              basicPay: 50000,
              paidDays: 30,
              bonus: 0,
              hra: 0,
              lta: 0,
              otherAllowance: 0,
              lossOfPayDays: 0,
              lossOfPay: 0,
              incomeTax: 0,
              healthInsurance: 0,
              epf: 0,
              esic: 0,
            },
          },
          {
            employeeId: "emp-2",
            employeeName: "Bob Jones",
            jobTitle: null,
            payData: {
              payRollId: undefined,
              employeeId: "emp-2",
              isProcessed: false,
              paidDate: null as never,
              basicPay: 0,
              paidDays: 0,
              bonus: 0,
              hra: 0,
              lta: 0,
              otherAllowance: 0,
              lossOfPayDays: 0,
              lossOfPay: 0,
              incomeTax: 0,
              healthInsurance: 0,
              epf: 0,
              esic: 0,
            },
          },
        ],
      },
    } as never);

    const container = await mount();
    const calculateRemainingBtn = Array.from(container.querySelectorAll("button")).find((btn) =>
      btn.textContent?.includes("Calculate") || btn.getAttribute("aria-label")?.includes("Calculate")
    );
    expect(calculateRemainingBtn).toBeDefined();
  });

  it("renders 'Month processed · Payslips published' chip when all employees are processed", async () => {
    vi.mocked(payrollServices.getEmployeePayRollData).mockResolvedValueOnce({
      data: {
        success: true,
        methodResults: [
          {
            employeeId: "emp-1",
            employeeName: "Alice Smith",
            jobTitle: null,
            payData: {
              payRollId: "pay-1",
              employeeId: "emp-1",
              isProcessed: true,
              workflowStatus: "PROCESSED",
              paidDate: null as never,
              basicPay: 50000,
              paidDays: 30,
              bonus: 0,
              hra: 0,
              lta: 0,
              otherAllowance: 0,
              lossOfPayDays: 0,
              lossOfPay: 0,
              incomeTax: 0,
              healthInsurance: 0,
              epf: 0,
              esic: 0,
            },
          },
        ],
      },
    } as never);

    const container = await mount();
    expect(container.textContent).toContain("Month processed · Payslips published");
  });

  it("renders the Filter button next to search and opens the filter popover on click", async () => {
    const container = await mount();
    const filterBtn = Array.from(container.querySelectorAll("button")).find((btn) =>
      btn.textContent?.includes("Filters") || btn.getAttribute("aria-label")?.includes("Filter")
    );
    expect(filterBtn).toBeDefined();

    await act(async () => {
      filterBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(document.body.textContent).toContain("Filter Records");
    expect(document.body.textContent).toContain("Payroll Status");
  });

  it("keeps summary chips display-only and filters records via the filter popover", async () => {
    vi.mocked(payrollServices.getEmployeePayRollData).mockResolvedValueOnce({
      data: {
        success: true,
        methodResults: [
          {
            employeeId: "emp-1",
            employeeName: "Alice Smith",
            jobTitle: null,
            payData: {
              payRollId: "pay-1",
              employeeId: "emp-1",
              isProcessed: true,
              workflowStatus: "PROCESSED",
              paidDate: null as never,
              basicPay: 50000,
              paidDays: 30,
              bonus: 0,
              hra: 0,
              lta: 0,
              otherAllowance: 0,
              lossOfPayDays: 0,
              lossOfPay: 0,
              incomeTax: 0,
              healthInsurance: 0,
              epf: 0,
              esic: 0,
            },
          },
          {
            employeeId: "emp-2",
            employeeName: "Bob Jones",
            jobTitle: null,
            payData: {
              payRollId: "pay-2",
              employeeId: "emp-2",
              isProcessed: false,
              workflowStatus: "DRAFT",
              paidDate: null as never,
              basicPay: 40000,
              paidDays: 30,
              bonus: 0,
              hra: 0,
              lta: 0,
              otherAllowance: 0,
              lossOfPayDays: 0,
              lossOfPay: 0,
              incomeTax: 0,
              healthInsurance: 0,
              epf: 0,
              esic: 0,
            },
          },
        ],
      },
    } as never);

    const container = await mount();
    const tableEl = container.querySelector('[data-testid="payroll-table"]');
    expect(tableEl?.getAttribute("data-count")).toBe("2");

    // Clicking on the Draft summary chip should NOT trigger filtering (it is display-only)
    const draftSummaryChip = Array.from(container.querySelectorAll(".MuiChip-root")).find((chip) =>
      chip.textContent?.includes("Draft: 1")
    );
    expect(draftSummaryChip).toBeDefined();

    await act(async () => {
      draftSummaryChip?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Still 2 rows because summary is display-only
    expect(tableEl?.getAttribute("data-count")).toBe("2");

    // Open filter popover via toolbar filter button
    const filterBtn = Array.from(container.querySelectorAll("button")).find((btn) =>
      btn.getAttribute("aria-label")?.includes("Filter")
    );
    expect(filterBtn).toBeDefined();

    await act(async () => {
      filterBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // In the filter popover, select the Draft status option
    const draftFilterOption = Array.from(document.body.querySelectorAll("p, span, div")).find(
      (el) => el.textContent?.trim() === "Draft"
    );
    expect(draftFilterOption).toBeDefined();

    await act(async () => {
      draftFilterOption?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Only 1 row (the draft row) should now be passed to the table
    expect(tableEl?.getAttribute("data-count")).toBe("1");
    expect(container.textContent).toContain("Filtered (1 shown)");
  });

  it("displays accurate criteria match badges and a visible Reset button in the filter popover", async () => {
    vi.mocked(payrollServices.getEmployeePayRollData).mockResolvedValueOnce({
      data: {
        success: true,
        methodResults: [
          {
            employeeId: "emp-1",
            employeeName: "Alice Smith",
            jobTitle: null,
            payData: {
              payRollId: "pay-1",
              employeeId: "emp-1",
              isProcessed: false,
              workflowStatus: "DRAFT",
              paidDate: null as never,
              basicPay: 50000,
              paidDays: 30,
              bonus: 5000,
              hra: 0,
              lta: 0,
              otherAllowance: 0,
              lossOfPayDays: 0,
              lossOfPay: 0,
              incomeTax: 2000,
              healthInsurance: 0,
              epf: 0,
              esic: 0,
            },
          },
          {
            employeeId: "emp-2",
            employeeName: "Bob Jones",
            jobTitle: null,
            payData: {
              payRollId: "pay-2",
              employeeId: "emp-2",
              isProcessed: false,
              workflowStatus: "DRAFT",
              paidDate: null as never,
              basicPay: 40000,
              paidDays: 30,
              bonus: 0,
              hra: 0,
              lta: 0,
              otherAllowance: 0,
              lossOfPayDays: 0,
              lossOfPay: 0,
              incomeTax: 0,
              healthInsurance: 0,
              epf: 0,
              esic: 0,
            },
          },
        ],
      },
    } as never);

    const container = await mount();

    // Open filter popover
    const filterBtn = Array.from(container.querySelectorAll("button")).find((btn) =>
      btn.getAttribute("aria-label")?.includes("Filter")
    );
    await act(async () => {
      filterBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Check that criteria sections exist with accurate match counts
    expect(document.body.textContent).toContain("Loss of Pay (LOP)");
    expect(document.body.textContent).toContain("Bonus / Incentives");
    expect(document.body.textContent).toContain("Income Tax (TDS)");

    // Reset button should be visible in the popover footer
    const resetBtn = Array.from(document.body.querySelectorAll("button")).find(
      (btn) => btn.textContent?.trim() === "Reset"
    );
    expect(resetBtn).toBeDefined();
    // Initially disabled because no filters are active
    expect(resetBtn?.hasAttribute("disabled")).toBe(true);

    // Toggle Bonus filter
    const bonusTile = Array.from(document.body.querySelectorAll("p, span, div")).find(
      (el) => el.textContent?.trim() === "Bonus / Incentives"
    );
    await act(async () => {
      bonusTile?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Reset button should now be enabled
    expect(resetBtn?.hasAttribute("disabled")).toBe(false);

    // Clear all button should be visible in header
    const clearAllBtn = Array.from(document.body.querySelectorAll("button")).find(
      (btn) => btn.textContent?.trim() === "Clear all"
    );
    expect(clearAllBtn).toBeDefined();

    // Click Reset
    await act(async () => {
      resetBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Filters should be cleared and reset disabled again
    expect(resetBtn?.hasAttribute("disabled")).toBe(true);
  });

  it("passes uncalculated employeeIds to generateMonthlyPayroll when remaining employees are calculated", async () => {
    vi.mocked(payrollServices.getEmployeePayRollData).mockResolvedValueOnce({
      data: {
        success: true,
        methodResults: [
          {
            employeeId: "emp-calculated",
            employeeName: "Alice Smith",
            jobTitle: null,
            payData: {
              payRollId: "pay-1",
              employeeId: "emp-calculated",
              isProcessed: false,
              workflowStatus: "DRAFT",
              paidDate: null as never,
              basicPay: 50000,
              paidDays: 30,
              bonus: 0,
              hra: 0,
              lta: 0,
              otherAllowance: 0,
              lossOfPayDays: 0,
              lossOfPay: 0,
              incomeTax: 0,
              healthInsurance: 0,
              epf: 0,
              esic: 0,
            },
          },
          {
            employeeId: "emp-remaining",
            employeeName: "Bob Remaining",
            jobTitle: null,
            payData: null as never, // uncalculated row
          },
        ],
      },
    } as never);

    vi.mocked(payrollServices.generateMonthlyPayroll).mockResolvedValueOnce({
      data: { success: true, message: "Payroll calculated." },
    } as never);

    const container = await mount();

    // Find the Calculate button (which should say "Calculate (1)")
    const calculateBtn = Array.from(container.querySelectorAll("button")).find((btn) =>
      btn.textContent?.includes("Calculate (1)")
    );
    expect(calculateBtn).toBeDefined();

    await act(async () => {
      calculateBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(payrollServices.generateMonthlyPayroll).toHaveBeenCalledWith(
      expect.objectContaining({
        employeeIds: ["emp-remaining"],
      })
    );
  });
});
