import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardOverview } from "../model";

vi.mock("@mui/icons-material", () => ({
  default: () => null,
  CalendarTodayOutlined: () => null,
  RefreshOutlined: () => null,
}));
vi.mock("react-intl", () => ({
  useIntl: () => ({
    locale: "en-US",
    formatMessage: ({ id, defaultMessage }: { id: string; defaultMessage?: string }, values?: Record<string, unknown>) => {
      const template = defaultMessage ?? id;
      return values ? template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? "")) : template;
    },
  }),
}));

const overview: DashboardOverview = {
  definitionVersion: "dashboard-overview.v4",
  asOfDate: "2026-11-17",
  timeZone: "Asia/Kolkata",
  generatedAtUtc: "2026-11-17T05:00:00Z",
  totalEmployees: 60,
  totalEmployeesChangePercent: 0,
  presentToday: 60,
  onLeaveToday: 0,
  absentToday: 0,
  isWorkingDay: true,
  openPositions: 3,
  headcountTrend: [],
  recentActivities: [],
};

let root: Root | null = null;

const render = (data?: DashboardOverview | null) => {
  const container = document.createElement("div");
  root = createRoot(container);
  act(() => root!.render(<DashboardHeader fullName="Ada Example" overview={data} />));
  return container;
};

describe("DashboardHeader date metadata", () => {
  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("shows the clean API date badge without verbose report metadata lines", () => {
    const container = render(overview);
    const date = container.querySelector("time");

    expect(date?.getAttribute("dateTime")).toBe("2026-11-17");
    expect(date?.getAttribute("aria-label")).toContain("Dashboard data for");
    expect(date?.textContent).toContain("Nov 17, 2026");
    expect(container.textContent).not.toContain("Report generated");
    expect(container.textContent).not.toContain("Source update times");
    expect(container.querySelectorAll("time")).toHaveLength(1);
  });

  it("does not substitute the browser date when the API date is invalid", () => {
    const container = render({ ...overview, asOfDate: null });

    expect(container.querySelector("time")).toBeNull();
  });

  it("handles manual refresh and reflects refreshing state", () => {
    const onRefresh = vi.fn();
    const container = document.createElement("div");
    root = createRoot(container);
    act(() => {
      root!.render(
        <DashboardHeader
          fullName="Ada Example"
          overview={overview}
          onRefresh={onRefresh}
          isRefreshing={false}
        />,
      );
    });

    const refreshButton = container.querySelector('button[aria-label="Refresh Data"]') as HTMLButtonElement | null;
    expect(refreshButton).not.toBeNull();
    expect(refreshButton?.disabled).toBe(false);

    act(() => {
      refreshButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onRefresh).toHaveBeenCalledTimes(1);

    act(() => {
      root!.render(
        <DashboardHeader
          fullName="Ada Example"
          overview={overview}
          onRefresh={onRefresh}
          isRefreshing={true}
        />,
      );
    });
    expect(refreshButton?.disabled).toBe(true);
  });
});
