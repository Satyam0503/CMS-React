import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EmployeeLeaveTypeBalance } from "../../../leaves/model";
import { EmployeeLeaveTypesCharts } from "./LeaveTypesChart";

vi.mock("react-intl", () => ({
  useIntl: () => ({ formatMessage: ({ id }: { id: string }) => id }),
}));

vi.mock("@mui/x-charts", () => ({
  BarChart: ({ xAxis, series }: any) => (
    <div
      data-testid="leave-balance-chart"
      data-labels={JSON.stringify(xAxis[0].data)}
      data-series={JSON.stringify(series.map((item: any) => item.data))}
    />
  ),
}));

const balance = (
  overrides: Partial<EmployeeLeaveTypeBalance>,
): EmployeeLeaveTypeBalance => ({
  leaveBalanceId: "balance-1",
  leavePolicyId: "policy-1",
  totalAllocated: 10,
  taken: 2,
  remaining: 8,
  name: "Annual Leave",
  code: "AL",
  description: "",
  paid: true,
  maxBalance: 20,
  minNoticeDays: 0,
  halfDayAllowed: true,
  weekendInclusive: false,
  holidayInclusive: false,
  ...overrides,
});

describe("EmployeeLeaveTypesCharts", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  afterEach(() => {
    if (root) {
      act(() => root?.unmount());
      root = null;
    }
    container?.remove();
    container = null;
  });

  const renderChart = (leaveBalance: EmployeeLeaveTypeBalance[]) => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root?.render(<EmployeeLeaveTypesCharts leaveBalance={leaveBalance} isLoading={false} />);
    });
    return container;
  };

  it("omits unlimited, unpaid, and unallocated policies from the chart", () => {
    const element = renderChart([
      balance({ name: "Annual Leave", code: "AL", maxBalance: 20 }),
      balance({ name: "Unlimited Medical", code: "MED", maxBalance: null }),
      balance({ name: "Unpaid Leave", code: "UL", paid: false, maxBalance: null }),
      balance({ name: "Not Allocated", code: "NA", totalAllocated: 0, taken: 0, remaining: 0 }),
    ]);

    const chart = element.querySelector("[data-testid='leave-balance-chart']");
    expect(JSON.parse(chart?.getAttribute("data-labels") ?? "[]")).toEqual(["Annual Leave"]);
    expect(JSON.parse(chart?.getAttribute("data-series") ?? "[]")).toEqual([[2], [8]]);
    expect(element.textContent).not.toContain("Unlimited Medical");
    expect(element.textContent).not.toContain("Unpaid Leave");
  });

  it("shows the empty-balance state when the employee only has unlimited leave", () => {
    const element = renderChart([
      balance({ name: "Unlimited Medical", maxBalance: null }),
    ]);

    expect(element.querySelector("[data-testid='leave-balance-chart']")).toBeNull();
    expect(element.textContent).toContain("MESSAGE.NO_LEAVE_DATA_AVAILABLE");
  });
});
