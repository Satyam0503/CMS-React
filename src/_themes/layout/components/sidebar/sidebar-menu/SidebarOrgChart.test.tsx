import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { IntlProvider } from "react-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SidebarMenuMain } from "./SidebarMenuMain";
import enLocale from "../../../../../../public/locales/en.json";
import { flattenMessages } from "../../../../../utils/common";
import { ModulesName, Roles } from "../../../../../utils/enums";

let root: Root | null = null;

const createMockStore = (
  permissions: string[] = [
    `${ModulesName.Employees}.View`,
    `${ModulesName.Employees}.Edit`,
    `${ModulesName.PayRoll}.View`,
    `${ModulesName.LeaveManagement}.View`,
    `${ModulesName.Attendance}.View`,
    `${ModulesName.PayrollSettings}.View`,
  ]
) => {
  return configureStore({
    reducer: {
      user: () => ({
        userData: {
          roleType: Roles.Administrator,
          modulePermission: permissions,
        },
      }),
    },
  });
};

const renderComponent = (currentIndex: number = 1) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  const store = createMockStore();
  const flatMessages = flattenMessages(enLocale);

  act(() => {
    root!.render(
      <Provider store={store}>
        <IntlProvider locale="en" messages={flatMessages}>
          <MemoryRouter initialEntries={["/employees/org-chart"]}>
            <SidebarMenuMain
              currentIndex={currentIndex}
              handleToggle={vi.fn()}
              isMiniSidebar={false}
            />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    );
  });
  return container;
};

describe("Sidebar Organization Chart Translation & Navigation", () => {
  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    document.body.innerHTML = "";
  });

  it("renders Employee Management as an expandable accordion with Employees and Employee Lifecycle (with Org Chart consolidated into Employees)", () => {
    const container = renderComponent(1);

    // Parent title
    expect(container.textContent).toContain("Employee Management");

    const links = Array.from(container.querySelectorAll("a"));
    const employeeLink = links.find((a) => a.getAttribute("href") === "/employees");
    const orgChartLink = links.find((a) => a.getAttribute("href") === "/employees/org-chart");
    const lifecycleLink = links.find((a) => a.getAttribute("href") === "/lifecycle-management");

    expect(employeeLink).toBeDefined();
    expect(employeeLink?.textContent).toContain("Employees");

    // Org Chart is consolidated into /employees as a view mode, no longer a redundant separate sidebar subtab
    expect(orgChartLink).toBeUndefined();

    expect(lifecycleLink).toBeDefined();
    expect(lifecycleLink?.textContent).toContain("Employee Lifecycle");
  });

  it("ensures Payroll only contains payroll subtabs and no longer contains Org Chart or Lifecycle", () => {
    const container = renderComponent(2);

    expect(container.textContent).toContain("Payroll");

    const links = Array.from(container.querySelectorAll("a"));
    const leaveLink = links.find((a) => a.getAttribute("href") === "/leavemanagement");
    const attendanceLink = links.find((a) => a.getAttribute("href") === "/attendance");

    expect(leaveLink).toBeDefined();
    expect(attendanceLink).toBeDefined();

    // Verify Org Chart and Lifecycle are NOT under PayRoll (when currentIndex = 2)
    const orgChartUnderPayroll = links.find((a) => a.getAttribute("href") === "/employees/org-chart");
    const lifecycleUnderPayroll = links.find((a) => a.getAttribute("href") === "/lifecycle-management");

    expect(orgChartUnderPayroll).toBeUndefined();
    expect(lifecycleUnderPayroll).toBeUndefined();
  });
});
