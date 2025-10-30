import { getRequest } from "../../../server/axios";
import { ServiceUrl } from "../../../utils/constant/Constant";
import {
  GetAllGenderDetailsResponseData,
  GetAllDepartmentDetailsResponseData,
  GetAllApplicationStatusData,
  GetUpComingHolidayEvent,
  GetUpComingCelebration,
} from "./model";

// Gender
export const getAllGenderInfo = async () => {
  return getRequest<GetAllGenderDetailsResponseData>(
    ServiceUrl.GET_ALL_GENDERS
  );
};

// Department
export const getAllDepartmentInfo = async () => {
  return getRequest<GetAllDepartmentDetailsResponseData>(
    ServiceUrl.GET_ALL_DEPARTMENT
  );
};

export const getAllApplicationStatus = async (vacancyId?: string) => {
  return getRequest<GetAllApplicationStatusData>(
    ServiceUrl.GET_APPLICATION_DATA,
    {
      params: { vacancyId },
    }
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
