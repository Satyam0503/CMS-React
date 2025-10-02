import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from "../../../server/axios";
import { ApiResponse } from "../../../utils/common_types";
import { ServiceUrl } from "../../../utils/constant/Constant";
import {
  GetAllGenderDetailsResponseData,
  GetAllDepartmentDetailsResponseData,
  GetAllApplicationStatusData,
  GetUpComingHolidayResponseData,
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

export const getUpcomingHolidays = async () => {
  return getRequest<GetUpComingHolidayResponseData>(
    ServiceUrl.GET_UPCOMING_HOLIDAY
  );
};
