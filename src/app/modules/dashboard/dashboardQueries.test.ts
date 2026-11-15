import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { dashboardQueryOptions } from "./dashboardQueries";
import {
  getAllDepartmentInfo,
  getDashboardOverview,
  getUpcomingCelebration,
  getUpcomingHolidayAndEvents,
} from "./dashboardservices";
import { getNotifications } from "../users/userservices";

vi.mock("./dashboardservices", () => ({
  getAllDepartmentInfo: vi.fn(),
  getDashboardOverview: vi.fn(),
  getUpcomingCelebration: vi.fn(),
  getUpcomingHolidayAndEvents: vi.fn(),
}));

vi.mock("../users/userservices", () => ({
  getNotifications: vi.fn(),
}));

const createTestClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 30_000 },
    },
  });

describe("dashboard queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalises the overview payload", async () => {
    vi.mocked(getDashboardOverview).mockResolvedValue({
      data: {
        success: true,
        methodResult: {
          totalEmployees: 142,
          totalEmployeesChangePercent: 6,
          presentToday: 128,
          onLeaveToday: 9,
          absentToday: -1,
          isWorkingDay: true,
          openPositions: 5,
          headcountTrend: [
            { month: "2026-11", count: 142 },
            { month: "2026-06", count: 117 },
          ],
          recentActivities: null,
        },
      },
    } as never);

    const data = await createTestClient().fetchQuery(dashboardQueryOptions.overview());

    expect(data).toMatchObject({ totalEmployees: 142, absentToday: 0, recentActivities: [] });
    expect(data?.headcountTrend.map((p) => p.month)).toEqual(["2026-06", "2026-11"]);
  });

  it("returns null when the overview request is not successful", async () => {
    vi.mocked(getDashboardOverview).mockResolvedValue({ data: { success: false, methodResult: null } } as never);

    await expect(createTestClient().fetchQuery(dashboardQueryOptions.overview())).resolves.toBeNull();
  });

  it("asks for the latest three notifications only", async () => {
    vi.mocked(getNotifications).mockResolvedValue({
      data: { success: true, methodResult: { notificationList: [{ userNotificationId: "n1" }], all: 1, unread: 1 } },
    } as never);

    const data = await createTestClient().fetchQuery(dashboardQueryOptions.notifications());

    expect(getNotifications).toHaveBeenCalledWith({ type: "all", pageNo: 1, records: 3 });
    expect(data).toEqual([{ userNotificationId: "n1" }]);
  });

  it("reuses fresh cached data instead of issuing duplicate requests", async () => {
    const response = { success: true, methodResults: [] };
    vi.mocked(getAllDepartmentInfo).mockResolvedValue({ data: response } as never);
    const client = createTestClient();
    const options = dashboardQueryOptions.departments();

    await client.fetchQuery(options);
    await client.fetchQuery(options);

    expect(getAllDepartmentInfo).toHaveBeenCalledOnce();
  });

  it("uses separate cache entries for each dashboard resource", () => {
    const keys = [
      dashboardQueryOptions.overview().queryKey,
      dashboardQueryOptions.departments().queryKey,
      dashboardQueryOptions.notifications().queryKey,
      dashboardQueryOptions.upcomingEvents().queryKey,
      dashboardQueryOptions.upcomingCelebrations().queryKey,
    ];

    expect(new Set(keys.map((key) => JSON.stringify(key))).size).toBe(5);
    expect(getUpcomingHolidayAndEvents).not.toHaveBeenCalled();
    expect(getUpcomingCelebration).not.toHaveBeenCalled();
  });
});
