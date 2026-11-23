import { act, type PropsWithChildren } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WorkforceMovementCard } from "./WorkforceMovementCard";

vi.mock("@mui/material", () => ({
  Box: ({ children, ...props }: PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  Skeleton: () => null,
  Typography: ({ children, ...props }: PropsWithChildren<Record<string, unknown>>) => <p {...props}>{children}</p>,
  alpha: () => "transparent",
  useColorScheme: () => ({ mode: "light", systemMode: "light" }),
  useTheme: () => ({ appStyle: "default" }),
}));
vi.mock("@mui/x-charts/BarChart", () => ({ BarChart: () => <svg data-testid="bar-chart" /> }));
vi.mock("../../theme/themePalettes", () => ({ getChartPalette: () => ["#123456", "#654321"] }));
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

describe("WorkforceMovementCard", () => {
  afterEach(() => { act(() => root?.unmount()); root = null; });

  it("announces every month and movement value and identifies the partial month", () => {
    const container = document.createElement("div");
    root = createRoot(container);
    act(() => root!.render(<WorkforceMovementCard trend={[
      { month: "2026-10", hires: 3, exits: 1, netChange: 2 },
      { month: "2026-11", hires: 2, exits: 1, netChange: 1 },
    ]} asOfDate="2026-11-17" loading={false} error={false} />));

    expect(container.querySelector('[role="img"]')?.getAttribute("aria-label")).toContain("October 2026: hires 3, exits 1, net 2");
    expect(container.querySelector('[role="img"]')?.getAttribute("aria-label")).toContain("November 2026: hires 2, exits 1, net 1");
    expect(container.querySelector('[role="img"]')?.getAttribute("aria-label")).toContain("Current month is partial through Nov 17, 2026.");
    expect(container.querySelector('[role="note"]')?.textContent).toContain("Current month is partial through Nov 17, 2026.");
    expect(container.querySelector('[data-testid="bar-chart"]')).not.toBeNull();
    const table = container.querySelector('table[aria-label="Monthly workforce movement data"]');
    expect(table?.textContent).toContain("October 2026");
    expect(table?.textContent).toContain("November 2026");
    expect(table?.textContent).toContain("3");
    expect(container.querySelector("details summary")?.textContent).toBe("View data table");
  });

  it("shows a useful empty state for legacy responses without movement data", () => {
    const container = document.createElement("div");
    root = createRoot(container);
    act(() => root!.render(<WorkforceMovementCard trend={undefined} loading={false} error={false} />));
    expect(container.textContent).toContain("Workforce movement data is unavailable.");
  });
});
