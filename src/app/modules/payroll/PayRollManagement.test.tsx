import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import PayRollManagement from "./PayRollManagement";
import * as payrollServices from "./services";

vi.mock("./components/PayrollRunsPanel", () => ({
  PayrollRunsPanel: () => <div data-testid="payroll-runs-panel">Payroll Runs Panel Content</div>,
}));

vi.mock("./components/PayRollTable", () => ({
  PayRollTable: () => <div data-testid="payroll-table">Monthly Register Table Content</div>,
}));

vi.mock("./components/UploadPayRollData", () => ({
  UploadPayRollData: () => <div data-testid="upload-payroll-data" />,
}));

vi.mock("./services", () => ({
  getEmployeePayRollData: vi.fn(),
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

describe("PayRollManagement tabs and views", () => {
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

  it("renders the unified tablist navigation with Payroll Runs and Monthly Register tabs", async () => {
    const container = await mount();
    const tablist = container.querySelector('[role="tablist"]');
    expect(tablist).not.toBeNull();

    const tabs = container.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(2);
    expect(tabs[0].textContent).toContain("Payroll Runs & Batches");
    expect(tabs[1].textContent).toContain("Monthly Register & Records");
  });

  it("defaults to the Payroll Runs panel when no query param is provided", async () => {
    const container = await mount();
    expect(container.querySelector('[data-testid="payroll-runs-panel"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="payroll-table"]')).toBeNull();
  });

  it("switches to the Monthly Register panel when the tab is clicked", async () => {
    const container = await mount();
    const registerTab = Array.from(container.querySelectorAll('[role="tab"]')).find((tab) =>
      tab.textContent?.includes("Monthly Register & Records")
    ) as HTMLElement;

    expect(registerTab).not.toBeNull();
    await act(async () => {
      registerTab.click();
    });

    expect(container.querySelector('[data-testid="payroll-table"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="payroll-runs-panel"]')).toBeNull();
  });

  it("opens the Monthly Register directly when initialized with ?view=register", async () => {
    const container = await mount(["/payroll?view=register"]);
    expect(container.querySelector('[data-testid="payroll-table"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="payroll-runs-panel"]')).toBeNull();
  });
});
