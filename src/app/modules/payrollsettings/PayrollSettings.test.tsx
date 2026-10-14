import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { IntlProvider } from "react-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getRequestMock, postRequestMock } = vi.hoisted(() => ({
  getRequestMock: vi.fn(),
  postRequestMock: vi.fn(),
}));
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("../../../server/axios", () => ({
  getRequest: getRequestMock,
  postRequest: postRequestMock,
}));

vi.mock("../../Redux/hooks", () => ({
  useAppSelector: (selector: any) =>
    selector({
      user: {
        userData: {
          roleType: 1, // Administrator
          modulePermission: [
            "Payroll_Settings.View",
            "Payroll_Settings.Create",
            "Payroll_Settings.Edit",
            "Payroll_Settings.Approve",
          ],
        },
      },
    }),
}));

vi.mock("../../Context/PageDataProvider", () => ({
  usePageData: () => ({ setPageTitle: vi.fn() }),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("./services", () => ({
  getCompanySalaries: vi.fn().mockResolvedValue({
    data: {
      methodResults: [
        {
          userId: "user-1",
          employeeId: "EMP-001",
          employeeName: "Alice Walker",
          jobTitle: "Software Engineer",
          activeSalary: {
            id: "sal-1",
            monthlyGross: 75000,
            annualCtc: 900000,
          },
        },
      ],
    },
  }),
  processPayroll: vi.fn().mockResolvedValue({ data: { success: true, message: "Processed" } }),
}));

vi.mock("../employees/employeeServices", () => ({
  getAllEmployees: vi.fn().mockResolvedValue({
    data: {
      methodResults: [
        {
          userId: "user-1",
          employeeId: "EMP-001",
          fullName: "Alice Walker",
          jobRole: "Software Engineer",
          payrollStatus: "Active",
        },
      ],
    },
  }),
}));

vi.mock("./components/EmployeeSalaryImportPanel", () => ({
  EmployeeSalaryImportPanel: ({ canEdit, canApprove, onPendingCountChange }: any) => {
    return (
      <div data-testid="employee-salary-import-panel">
        <span>Employee Salary Import Workspace</span>
        <button
          data-testid="simulate-pending-count"
          onClick={() => onPendingCountChange?.(3)}
        >
          Simulate 3 Pending
        </button>
      </div>
    );
  },
}));

vi.mock("./components/SalaryTable", () => ({
  SalaryTable: ({ salaryData }: any) => (
    <div data-testid="salary-table">
      <span>Salary Register Rows: {salaryData?.length}</span>
    </div>
  ),
}));

vi.mock("@mui/icons-material", () => ({
  LockOutlined: () => null,
  LockOpenOutlined: () => null,
  CloudUploadRounded: () => null,
  PaymentsOutlined: () => null,
}));

import PayrollSettings from "./PayrollSettings";

const roots: Root[] = [];

function renderSettings() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push(root);
  return { container, root };
}

describe("PayrollSettings Unified Tabs & Navigation", () => {
  beforeEach(() => {
    getRequestMock.mockImplementation(async (url: string) => {
      if (url === "api/attendance/penalty/month/lock-status") {
        return { data: { isLocked: true, eligibleEmployeeCount: 1, lockedEmployeeCount: 1 } };
      }
      if (url === "api/payroll/divisor-policy") {
        return {
          data: {
            payrollMode: "Standard",
            divisorPolicy: "CALENDAR_DAYS",
            requireAttendanceLock: true,
          },
        };
      }
      return { data: {} };
    });
  });

  afterEach(async () => {
    for (const root of roots.splice(0)) {
      await act(async () => root.unmount());
    }
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("renders both 'Active Salaries & Register' and 'Import & Salary Approvals' tabs", async () => {
    const { container, root } = renderSettings();
    await act(async () => {
      root.render(
        <IntlProvider locale="en" messages={{ "MODULES.PAYROLL_SETTINGS": "Payroll Settings" }}>
          <PayrollSettings />
        </IntlProvider>
      );
    });

    const tabs = container.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(2);
    expect(tabs[0].textContent).toContain("Active Salaries & Register");
    expect(tabs[1].textContent).toContain("Import & Salary Approvals");

    // By default, the active salaries tab should show the salary table
    expect(container.querySelector('[data-testid="salary-table"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="employee-salary-import-panel"]')).toBeNull();
  });

  it("switches to the Salary Import panel when clicking the second tab", async () => {
    const { container, root } = renderSettings();
    await act(async () => {
      root.render(
        <IntlProvider locale="en" messages={{ "MODULES.PAYROLL_SETTINGS": "Payroll Settings" }}>
          <PayrollSettings />
        </IntlProvider>
      );
    });

    const tabs = container.querySelectorAll('[role="tab"]');
    await act(async () => {
      (tabs[1] as HTMLElement).click();
    });

    // Verify the Salary Import panel is rendered and SalaryTable is hidden
    expect(container.querySelector('[data-testid="employee-salary-import-panel"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="salary-table"]')).toBeNull();

    // Verify simulate pending count updates badge
    const simulateButton = container.querySelector('[data-testid="simulate-pending-count"]') as HTMLElement;
    await act(async () => {
      simulateButton.click();
    });

    expect(tabs[1].textContent).toContain("3 pending");
  });

  it("switches back to Active Salaries & Register seamlessly", async () => {
    const { container, root } = renderSettings();
    await act(async () => {
      root.render(
        <IntlProvider locale="en" messages={{ "MODULES.PAYROLL_SETTINGS": "Payroll Settings" }}>
          <PayrollSettings />
        </IntlProvider>
      );
    });

    const tabs = container.querySelectorAll('[role="tab"]');
    // Switch to tab 1 (Import)
    await act(async () => {
      (tabs[1] as HTMLElement).click();
    });
    expect(container.querySelector('[data-testid="employee-salary-import-panel"]')).not.toBeNull();

    // Switch back to tab 0 (Register)
    await act(async () => {
      (tabs[0] as HTMLElement).click();
    });
    expect(container.querySelector('[data-testid="salary-table"]')).not.toBeNull();
  });
});

