import { getRequest } from "../../../server/axios";
import { ServiceUrl } from "../../../utils/constant/Constant";
import {
  GetAllDepartmentDetailsResponseData,
  GetDashboardOverviewData,
  GetUpComingHolidayEvent,
  GetUpComingCelebration,
} from "./model";

export const getDashboardOverview = () => {
  return getRequest<GetDashboardOverviewData>(ServiceUrl.GET_DASHBOARD_OVERVIEW);
};

// Department
export const getAllDepartmentInfo = async () => {
  return getRequest<GetAllDepartmentDetailsResponseData>(
    ServiceUrl.GET_ALL_DEPARTMENT
  );
};

export const getUpcomingHolidayAndEvents = async () => {
  return getRequest<GetUpComingHolidayEvent>(
    ServiceUrl.GET_UPCOMING_HOLIDAY_AND_EVENT
  );
};

export const getUpcomingCelebration = () => {
  return getRequest<GetUpComingCelebration>(
    ServiceUrl.GET_UPCOMING_CELEBRATIONS
  );
};
