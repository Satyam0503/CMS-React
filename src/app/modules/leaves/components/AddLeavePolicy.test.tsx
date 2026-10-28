import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "../../../Redux/Reducers/userSlice";
import AddLeavePolicy from "./AddLeavePolicy";
import { Roles } from "../../../../utils/enums";
import { LeavePolicyModel } from "../model";

// Mock axios server calls
vi.mock("../../../../server/axios", () => ({
  getRequest: vi.fn((url: string) => {
    if (url.includes("weekly-offs")) {
      return Promise.resolve({ data: { offDays: [0, 6] } });
    }
    if (url.includes("attendance-status-settings")) {
      return Promise.resolve({
        data: {
          methodResults: [
            { code: "CL", name: "Casual Leave", isActive: true, requiresTime: false, isAvailableForLeaveManagement: true, colorHex: "#3b82f6" },
            { code: "WFH", name: "Work From Home", isActive: true, requiresTime: true, isAvailableForLeaveManagement: true, colorHex: "#10b981" },
            { code: "WFH-HD", name: "WFH Half Day", isActive: true, requiresTime: true, isAvailableForLeaveManagement: true, colorHex: "#f59e0b" },
          ],
        },
      });
    }
    return Promise.resolve({ data: {} });
  }),
  postRequest: vi.fn(() => Promise.resolve({ data: { success: true } })),
}));

// Mock employee services
vi.mock("../../employees/employeeServices", () => ({
  getAllEmployees: vi.fn(() =>
    Promise.resolve({
      data: {
        success: true,
        methodResults: [
          { userId: "emp-1", fullName: "John Doe", email: "john@example.com" },
          { userId: "emp-2", fullName: "Jane Smith", email: "jane@example.com" },
        ],
      },
    })
  ),
}));

// Mock toast notifications
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock("react-intl", () => ({
  useIntl: () => ({
    formatMessage: ({ id, defaultMessage }: { id: string; defaultMessage?: string }) => defaultMessage || id,
  }),
}));

const mockStandardLeavePolicy: LeavePolicyModel = {
  id: "policy-1",
  name: "Casual Leave",
  code: "CL",
  description: "Standard casual leave entitlement",
  status: true,
  paid: true,
  accrualPeriod: 1,
  accrualAmount: 1,
  maxBalance: 12,
  carryOverAllowed: true,
  carryOverLimit: 5,
  minNoticeDays: 2,
  halfDayAllowed: true,
  weekendInclusive: false,
  holidayInclusive: false,
  attendanceStatusCode: "CL",
  applicableTo: [],
  policyType: 1,
  workFromHome: null,
  lifecycle: null,
};

const mockWfhPolicy: LeavePolicyModel = {
  id: "policy-2",
  name: "WFH Policy",
  code: "WFH",
  description: "Weekly remote work",
  status: true,
  paid: true,
  accrualPeriod: 3,
  accrualAmount: 0,
  maxBalance: 0,
  carryOverAllowed: false,
  carryOverLimit: 0,
  minNoticeDays: 0,
  halfDayAllowed: true,
  weekendInclusive: false,
  holidayInclusive: false,
  attendanceStatusCode: "WFH",
  applicableTo: ["emp-1"],
  policyType: 2,
  workFromHome: {
    approvalRequired: true,
    approverStrategy: "REPORTING_MANAGER",
    reasonRequired: true,
    allowFullDay: true,
    allowFirstHalf: true,
    allowSecondHalf: true,
    allowMixedHalfDayLeave: true,
    allowOnWeeklyOff: false,
    allowOnHoliday: false,
    fullDayAttendanceStatusCode: "WFH",
    halfDayAttendanceStatusCode: "WFH-HD",
    mixedAttendanceStatusCode: null,
    wfhWfoAttendanceStatusCode: null,
    wfhHdAttendanceStatusCode: null,
    useEffectiveOfficeSchedule: true,
    breakMinutes: 30,
    maxDaysPerWeek: 2,
    maxDaysPerMonth: null,
    fullDayRequiredWorkingMinutes: 480,
    halfDayRequiredWorkingMinutes: null,
    sameDayCutoffTime: "10:00",
    sameDayGraceMinutes: 15,
    allowLateApplicationWithApproval: true,
    allowedDaysOfWeek: ["Monday", "Friday"],
    blockedDaysOfWeek: ["Wednesday"],
  },
  lifecycle: null,
};

describe("AddLeavePolicy Component", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement("div");
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
    vi.clearAllMocks();
  });

  const renderComponent = (
    initialValues: LeavePolicyModel,
    isEdit: boolean = false,
    modulePermissions: string[] = ["Leave_Management.Create", "Work_From_Home.Create"]
  ) => {
    const store = configureStore({
      reducer: { user: userReducer },
      preloadedState: {
        user: {
          userData: {
            userId: "admin-1",
            roleType: Roles.Administrator,
            modulePermission: modulePermissions,
          } as any,
        },
      },
    });

    act(() => {
      root?.render(
        <Provider store={store}>
          <AddLeavePolicy
            open={true}
            handleClose={vi.fn()}
            isEdit={isEdit}
            initialValues={initialValues}
            handleRefresh={vi.fn()}
          />
        </Provider>
      );
    });

    return container;
  };

  it("renders Standard Leave Policy with 4 clean tabs", async () => {
    await act(async () => {
      renderComponent(mockStandardLeavePolicy, true);
    });

    expect(document.body.textContent).toContain("Basic Details");
    expect(document.body.textContent).toContain("Accrual & Balance");
    expect(document.body.textContent).toContain("Special Cases");
    expect(document.body.textContent).toContain("Eligible Employees");
    expect(document.body.textContent).toContain("Casual Leave");
    expect(document.body.textContent).toContain("CL");
  });

  it("renders Work From Home Policy with dedicated WFH tabs", async () => {
    await act(async () => {
      renderComponent(mockWfhPolicy, true);
    });

    expect(document.body.textContent).toContain("Basic Details");
    expect(document.body.textContent).toContain("Schedule & Limits");
    expect(document.body.textContent).toContain("Cutoff & Overrides");
    expect(document.body.textContent).toContain("Half-Day & Combos");
    expect(document.body.textContent).toContain("Eligible Employees");
    expect(document.body.textContent).toContain("WFH Policy");
  });

  it("switches tabs when tab headers are clicked", async () => {
    await act(async () => {
      renderComponent(mockStandardLeavePolicy, true);
    });

    // Find the Accrual & Balance tab button
    const accrualTab = Array.from(document.body.querySelectorAll("button[role='tab']")).find((b) =>
      b.textContent?.includes("Accrual & Balance")
    );
    expect(accrualTab).toBeDefined();

    await act(async () => {
      accrualTab?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Should display accrual fields
    expect(document.body.textContent).toContain("Leave Accrual & Credit Rules");
    expect(document.body.textContent).toContain("Leave Credit Frequency");
    expect(document.body.textContent).toContain("Leaves Credited per Cycle");
    expect(document.body.textContent).toContain("Maximum Leave Balance");
  });

  it("switches to Schedule & Limits tab for WFH and shows interactive weekday chips", async () => {
    await act(async () => {
      renderComponent(mockWfhPolicy, true);
    });

    const scheduleTab = Array.from(document.body.querySelectorAll("button[role='tab']")).find((b) =>
      b.textContent?.includes("Schedule & Limits")
    );
    expect(scheduleTab).toBeDefined();

    await act(async () => {
      scheduleTab?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(document.body.textContent).toContain("Allowed WFH Weekdays");
    expect(document.body.textContent).toContain("Mandatory In-Office Days (Core Days)");
    expect(document.body.textContent).toContain("Mon–Fri");
    expect(document.body.textContent).toContain("All Days");
  });

  it("allows selecting employee eligibility scope cleanly", async () => {
    await act(async () => {
      renderComponent(mockStandardLeavePolicy, true);
    });

    const eligibilityTab = Array.from(document.body.querySelectorAll("button[role='tab']")).find((b) =>
      b.textContent?.includes("Eligible Employees")
    );
    expect(eligibilityTab).toBeDefined();

    await act(async () => {
      eligibilityTab?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(document.body.textContent).toContain("Policy Applicability & Eligibility");
    expect(document.body.textContent).toContain("All Employees");
    expect(document.body.textContent).toContain("Specific Employees");
    expect(document.body.textContent).toContain("Unassigned (Draft)");
  });
});
