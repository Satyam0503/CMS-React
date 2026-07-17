import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { dashboardQueryOptions } from "./dashboardQueries";
import {
  getAllDepartmentInfo,
  getAllGenderInfo,
  getUpcomingCelebration,
  getUpcomingHolidayAndEvents,
} from "./dashboardservices";

vi.mock("./dashboardservices", () => ({
  getAllDepartmentInfo: vi.fn(),
  getAllGenderInfo: vi.fn(),
  getUpcomingCelebration: vi.fn(),
  getUpcomingHolidayAndEvents: vi.fn(),
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

  it("fetches gender data through the existing dashboard service", async () => {
    const response = {
      success: true,
      methodResults: [{ gender: "male", count: 4 }],
    };
    vi.mocked(getAllGenderInfo).mockResolvedValue({ data: response } as never);

    const data = await createTestClient().fetchQuery(
      dashboardQueryOptions.gender(),
    );

    expect(data).toEqual(response);
    expect(getAllGenderInfo).toHaveBeenCalledOnce();
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
      dashboardQueryOptions.gender().queryKey,
      dashboardQueryOptions.departments().queryKey,
      dashboardQueryOptions.upcomingEvents().queryKey,
      dashboardQueryOptions.upcomingCelebrations().queryKey,
    ];

    expect(new Set(keys.map((key) => JSON.stringify(key))).size).toBe(4);
    expect(getUpcomingHolidayAndEvents).not.toHaveBeenCalled();
    expect(getUpcomingCelebration).not.toHaveBeenCalled();
  });
});

