import { queryOptions, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../query/queryKeys";
import {
  getAllDepartmentInfo,
  getDashboardOverview,
  getUpcomingCelebration,
  getUpcomingHolidayAndEvents,
} from "./dashboardservices";
import { getNotifications } from "../users/userservices";
import { toDashboardOverview } from "./dashboardMetrics";

export const DASHBOARD_NOTIFICATION_COUNT = 3;

export const dashboardQueryOptions = {
  overview: () =>
    queryOptions({
      queryKey: queryKeys.dashboard.overview,
      queryFn: async () => toDashboardOverview((await getDashboardOverview()).data),
    }),
  departments: () =>
    queryOptions({
      queryKey: queryKeys.dashboard.departments,
      queryFn: async () => (await getAllDepartmentInfo()).data,
    }),
  notifications: () =>
    queryOptions({
      queryKey: queryKeys.dashboard.notifications,
      queryFn: async () => {
        const { data } = await getNotifications({ type: "all", pageNo: 1, records: DASHBOARD_NOTIFICATION_COUNT });
        return data?.success ? data.methodResult?.notificationList ?? [] : [];
      },
    }),
  upcomingEvents: () =>
    queryOptions({
      queryKey: queryKeys.dashboard.upcomingEvents,
      queryFn: async () => (await getUpcomingHolidayAndEvents()).data,
    }),
  upcomingCelebrations: () =>
    queryOptions({
      queryKey: queryKeys.dashboard.upcomingCelebrations,
      queryFn: async () => (await getUpcomingCelebration()).data,
    }),
};

export const useDashboardOverviewQuery = (enabled = true) =>
  useQuery({ ...dashboardQueryOptions.overview(), enabled });
export const useDepartmentsQuery = (enabled = true) =>
  useQuery({ ...dashboardQueryOptions.departments(), enabled });
export const useDashboardNotificationsQuery = () =>
  useQuery(dashboardQueryOptions.notifications());
export const useUpcomingEventsQuery = (enabled = true) =>
  useQuery({ ...dashboardQueryOptions.upcomingEvents(), enabled });
export const useUpcomingCelebrationsQuery = () =>
  useQuery(dashboardQueryOptions.upcomingCelebrations());
