import { act, type PropsWithChildren } from "react";
import { createRoot, Root } from "react-dom/client";
import dayjs from "dayjs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EmployeeTrendCard } from "./EmployeeTrendCard";

vi.mock("@mui/material", () => ({
  Box: ({ children, sx, ...props }: PropsWithChildren<Record<string, unknown>>) => {
    void sx;
    return <div {...props}>{children}</div>;
  },
  Typography: ({ children, sx, ...props }: PropsWithChildren<Record<string, unknown>>) => {
    void sx;
    return <p {...props}>{children}</p>;
  },
  Skeleton: () => null,
  alpha: () => "transparent",
  useColorScheme: () => ({ mode: "light", systemMode: "light" }),
  useTheme: () => ({ appStyle: "default" }),
}));

vi.mock("@mui/x-charts/LineChart", () => ({ LineChart: () => <svg data-testid="line-chart" /> }));
vi.mock("../../theme/themePalettes", () => ({ getChartPalette: () => ["#123456"] }));
vi.mock("./AttendanceOverviewCard", () => ({ RangeLabel: () => null }));
vi.mock("./DashboardCard", () => ({
  CardMessage: ({ children }: PropsWithChildren) => <p>{children}</p>,
  DashboardCard: ({ children, title }: PropsWithChildren<{ title: string }>) => (
    <section><h2>{title}</h2>{children}</section>
  ),
  LoadError: () => <p role="alert">Load error</p>,
}));
vi.mock("react-intl", () => ({
  useIntl: () => ({
    locale: "en",
    formatMessage: ({ id, defaultMessage }: { id: string; defaultMessage?: string }, values?: Record<string, unknown>) =>
      Object.entries(values ?? {}).reduce(
        (message, [key, value]) => message.split(`{${key}}`).join(String(value)),
        defaultMessage ?? id,
      ),
  }),
}));

let root: Root | null = null;

describe("EmployeeTrendCard accessibility", () => {
  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("exposes every plotted month and headcount in the chart's accessible name", () => {
    const container = document.createElement("div");
    root = createRoot(container);
    act(() => root!.render(<EmployeeTrendCard
      trend={[
        { month: "2026-05", count: 24 },
        { month: "2026-06", count: 27 },
        { month: "2026-07", count: 25 },
      ]}
      loading={false}
      error={false}
    />));

    const chart = container.querySelector('[role="img"]');
    expect(chart?.getAttribute("aria-label")).toContain("May 2026: 24");
    expect(chart?.getAttribute("aria-label")).toContain("June 2026: 27");
    expect(chart?.getAttribute("aria-label")).toContain("July 2026: 25");
  });

  it("exposes all twelve months when the longer trend is available", () => {
    const container = document.createElement("div");
    root = createRoot(container);
    const trend = Array.from({ length: 12 }, (_, index) => ({
      month: dayjs("2025-12-01").add(index, "month").format("YYYY-MM"),
      count: 30 + index,
    }));
    act(() => root!.render(<EmployeeTrendCard trend={trend} asOfDate="2026-11-17" loading={false} error={false} />));

    const chart = container.querySelector('[role="img"]');
    expect(chart?.getAttribute("aria-label")).toContain("December 2025: 30");
    expect(chart?.getAttribute("aria-label")).toContain("November 2026: 41");
    expect(chart?.getAttribute("aria-label")).toContain("Current month is partial through Nov 17, 2026.");
    expect(container.querySelector('[role="note"]')?.textContent).toContain("Current month is partial through Nov 17, 2026.");
  });

  it("does not label an older trend as partial when the final trend month is stale", () => {
    const container = document.createElement("div");
    root = createRoot(container);
    act(() => root!.render(<EmployeeTrendCard
      trend={[{ month: "2026-09", count: 10 }, { month: "2026-10", count: 11 }]}
      asOfDate="2026-11-17"
      loading={false}
      error={false}
    />));

    expect(container.querySelector('[role="note"]')).toBeNull();
    expect(container.querySelector('[role="img"]')?.getAttribute("aria-label")).not.toContain("partial");
  });

  it("does not label the current month when the as-of date is not a real calendar date", () => {
    const container = document.createElement("div");
    root = createRoot(container);
    act(() => root!.render(<EmployeeTrendCard
      trend={[{ month: "2026-10", count: 10 }, { month: "2026-11", count: 11 }]}
      asOfDate="2026-11-31"
      loading={false}
      error={false}
    />));

    expect(container.querySelector('[role="note"]')).toBeNull();
    expect(container.querySelector('[role="img"]')?.getAttribute("aria-label")).not.toContain("partial");
  });
});
