import { act, type PropsWithChildren } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LeaveRequestCohortCard } from "./LeaveRequestCohortCard";

vi.mock("@mui/material", () => ({
  Box: ({ children, ...props }: PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  Skeleton: () => null,
  Typography: ({ children, ...props }: PropsWithChildren<Record<string, unknown>>) => <p {...props}>{children}</p>,
  alpha: () => "transparent",
  useColorScheme: () => ({ mode: "light", systemMode: "light" }),
  useTheme: () => ({ appStyle: "default" }),
}));
vi.mock("@mui/x-charts/BarChart", () => ({ BarChart: () => <svg data-testid="bar-chart" /> }));
vi.mock("../../theme/themePalettes", () => ({ getChartPalette: () => ["#123456", "#234567", "#345678", "#456789", "#567890", "#678901", "#789012", "#890123"] }));
vi.mock("./AttendanceOverviewCard", () => ({ RangeLabel: () => null }));
vi.mock("./DashboardCard", () => ({
  CardMessage: ({ children }: PropsWithChildren) => <p>{children}</p>,
  DashboardCard: ({ children, title }: PropsWithChildren<{ title: string }>) => <section><h2>{title}</h2>{children}</section>,
  LoadError: () => <p role="alert">Load error</p>,
}));
vi.mock("react-intl", () => ({ useIntl: () => ({
  locale: "en",
  formatMessage: ({ id, defaultMessage }: { id: string; defaultMessage?: string }, values?: Record<string, unknown>) =>
    Object.entries(values ?? {}).reduce((message, [key, value]) => message.split(`{${key}}`).join(String(value)), defaultMessage ?? id),
}) }));

let root: Root | null = null;

describe("LeaveRequestCohortCard", () => {
  afterEach(() => { act(() => root?.unmount()); root = null; });

  it("announces every submission cohort, current status buckets, and the partial month", () => {
    const container = document.createElement("div");
    root = createRoot(container);
    act(() => root!.render(<LeaveRequestCohortCard trend={[
      { month: "2026-10", totalRequests: 3, pending: 1, approved: 1, rejected: 0, withdrawn: 1, otherStatus: 0 },
      { month: "2026-11", totalRequests: 2, pending: 1, approved: 1, rejected: 0, withdrawn: 0, otherStatus: 0 },
    ]} asOfDate="2026-11-17" loading={false} error={false} />));

    const chart = container.querySelector('[role="img"]');
    expect(chart?.getAttribute("aria-label")).toContain("October 2026: 3 requests");
    expect(chart?.getAttribute("aria-label")).toContain("pending 1, approved 1, rejected 0, withdrawn 1");
    expect(chart?.getAttribute("aria-label")).toContain("November 2026: 2 requests");
    expect(chart?.getAttribute("aria-label")).toContain("Current submission month is partial through Nov 17, 2026.");
    expect(container.textContent).toContain("Grouped by submission month; status buckets show each request's current status, which can change later.");
    expect(container.querySelector('[data-testid="bar-chart"]')).not.toBeNull();
    const table = container.querySelector('table[aria-label="Leave requests by submission month and current status"]');
    expect(table?.querySelectorAll("tbody tr")).toHaveLength(2);
    expect(table?.textContent).toContain("October 2026");
    expect(table?.textContent).toContain("November 2026");
    expect(table?.textContent).toContain("3");
    expect(table?.textContent).toContain("Withdrawn");
    expect(container.querySelector("details summary")?.textContent).toBe("View data table");
  });

  it("shows an empty state for older API responses without leave cohorts", () => {
    const container = document.createElement("div");
    root = createRoot(container);
    act(() => root!.render(<LeaveRequestCohortCard trend={undefined} loading={false} error={false} />));
    expect(container.textContent).toContain("Leave request cohort data is unavailable.");
  });
});
