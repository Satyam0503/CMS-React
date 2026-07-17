import { queryOptions, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../query/queryKeys";
import {
  getAllDepartmentInfo,
  getAllGenderInfo,
  getUpcomingCelebration,
  getUpcomingHolidayAndEvents,
} from "./dashboardservices";

export const dashboardQueryOptions = {
  gender: () =>
    queryOptions({
      queryKey: queryKeys.dashboard.gender,
      queryFn: async () => (await getAllGenderInfo()).data,
    }),
  departments: () =>
    queryOptions({
      queryKey: queryKeys.dashboard.departments,
      queryFn: async () => (await getAllDepartmentInfo()).data,
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

export const useGenderQuery = () => useQuery(dashboardQueryOptions.gender());
export const useDepartmentsQuery = () =>
  useQuery(dashboardQueryOptions.departments());
export const useUpcomingEventsQuery = () =>
  useQuery(dashboardQueryOptions.upcomingEvents());
export const useUpcomingCelebrationsQuery = () =>
  useQuery(dashboardQueryOptions.upcomingCelebrations());

