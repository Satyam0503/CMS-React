import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { IntlProvider } from "react-intl";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Employees from "./Employees";
import { PageDataProvider } from "../../Context/PageDataProvider";
import { Roles } from "../../../utils/enums";
import enLocale from "../../../../public/locales/en.json";
import { flattenMessages } from "../../../utils/common";

vi.mock("../../shared/components/C_DataGrid", () => ({
  CustomDataGrid: () => <div data-testid="custom-data-grid">Table Data Grid</div>,
}));

vi.mock("@mui/x-data-grid", () => ({}));

vi.mock("./employeeServices", () => ({
  getAllEmployees: vi.fn().mockResolvedValue({
    data: {
      success: true,
      methodResults: [
        {
          userId: "emp-1",
          employeeId: "EMP001",
          fullName: "Satyam Dubey",
          email: "satyam@codeji.in",
          phoneNumber: "9876543210",
          gender: "Male",
          employmentStatus: "Active",
          availabilityStatus: "Working",
          accountStatus: "Active",
          payrollStatus: "Active",
          isVerified: true,
        },
      ],
      totalRecords: 1,
    },
  }),
  resendInvitationLink: vi.fn(),
}));

vi.mock("./components/AddEmployeeStepper", () => ({
  AddEmployeeStepper: () => null,
}));

vi.mock("./components/BulkImportEmployeesModal", () => ({
  BulkImportEmployeesModal: () => null,
}));

vi.mock("./components/EmployeeFilter", () => ({
  EmployeeFilter: () => null,
  initialFilterValues: {},
}));

vi.mock("./components/EmployeeGridView", () => ({
  EmployeeGridView: () => <div data-testid="employee-grid-view">Employee Grid</div>,
}));

vi.mock("./orgChart/OrgChartPage", () => ({
  default: ({ embedded }: { embedded?: boolean }) => (
    <div data-testid="embedded-org-chart" data-embedded={String(embedded)}>
      Organization Chart Hierarchy View
    </div>
  ),
  OrgChartPage: ({ embedded }: { embedded?: boolean }) => (
    <div data-testid="embedded-org-chart" data-embedded={String(embedded)}>
      Organization Chart Hierarchy View
    </div>
  ),
}));

let root: Root | null = null;
let container: HTMLDivElement | null = null;

const createMockStore = () => {
  return configureStore({
    reducer: {
      user: () => ({
        userData: {
          userId: "emp-1",
          roleType: Roles.Administrator,
          modulePermission: ["Employees.View", "Employees.Create", "Employees.Edit"],
        },
      }),
      filters: () => ({
        employee: null,
      }),
      onlineUsers: () => ({
        onlineUsers: [],
      }),
    },
  });
};

describe("Employees ViewMode & OrgChart Integration", () => {
  beforeEach(() => {
    container = document.createElement("div");
    // Header actions portal target
    const headerPortal = document.createElement("div");
    headerPortal.id = "page-header-actions";
    document.body.appendChild(headerPortal);
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => root?.unmount());
      root = null;
    }
    if (container) {
      container.remove();
      container = null;
    }
    const headerPortal = document.getElementById("page-header-actions");
    if (headerPortal) headerPortal.remove();
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  const renderComponent = async (initialUrl: string = "/employees") => {
    const store = createMockStore();
    const flatMessages = flattenMessages(enLocale);

    await act(async () => {
      root!.render(
        <Provider store={store}>
          <IntlProvider locale="en" messages={flatMessages}>
            <PageDataProvider>
              <MemoryRouter initialEntries={[initialUrl]}>
                <Routes>
                  <Route path="/employees" element={<Employees />} />
                </Routes>
              </MemoryRouter>
            </PageDataProvider>
          </IntlProvider>
        </Provider>,
      );
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });
  };

  it("renders ToggleButtonGroup with table, grid, and tree view options and no detached org chart button", async () => {
    await renderComponent("/employees");

    const headerPortal = document.getElementById("page-header-actions");
    expect(headerPortal).not.toBeNull();

    // Toggle button group should have 3 view modes: table, grid, tree
    const toggleButtons = headerPortal?.querySelectorAll(".MuiToggleButton-root");
    expect(toggleButtons?.length).toBe(3);

    const values = Array.from(toggleButtons ?? []).map((btn) => btn.getAttribute("value"));
    expect(values).toContain("table");
    expect(values).toContain("grid");
    expect(values).toContain("tree");

    // The old standalone AppIconButton that called navigate('/employees/org-chart') should not exist
    const standaloneOrgChartBtn = headerPortal?.querySelector('[aria-label="View Organization Chart"]');
    expect(standaloneOrgChartBtn).toBeNull();
  });

  it("renders embedded OrgChartPage when navigating to /employees?view=tree", async () => {
    await renderComponent("/employees?view=tree");

    const orgChartEmbedded = container?.querySelector('[data-testid="embedded-org-chart"]');
    expect(orgChartEmbedded).not.toBeNull();
    expect(orgChartEmbedded?.getAttribute("data-embedded")).toBe("true");
    expect(orgChartEmbedded?.textContent).toContain("Organization Chart Hierarchy View");
  });

  it("switches to tree view and renders embedded OrgChartPage when clicking the tree toggle button", async () => {
    await renderComponent("/employees");

    const headerPortal = document.getElementById("page-header-actions");
    const treeToggleBtn = Array.from(headerPortal?.querySelectorAll(".MuiToggleButton-root") ?? []).find(
      (btn) => btn.getAttribute("value") === "tree",
    );
    expect(treeToggleBtn).toBeDefined();

    await act(async () => {
      treeToggleBtn!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });

    const orgChartEmbedded = container?.querySelector('[data-testid="embedded-org-chart"]');
    expect(orgChartEmbedded).not.toBeNull();
    expect(orgChartEmbedded?.getAttribute("data-embedded")).toBe("true");
  });
});
