import { ResponseData } from "../../../utils/common_types";

export interface GenderModel {
  gender: string;
  count: number;
}

export interface DepartmentResponseModel {
  label: Record<string, string>;
  departmentId: string;
  employeeCount: number;
}
export interface ApplicationStatusModel {
  totalApplications: number;
  applicationStatusData: {
    activityType: number;
    count: number;
  }[];
}

export type UpComingHolidayModel = {
  holidayId: string;
  holidayName: string;
  date: string;
  holidayCoverImageUrl: string | null;
};

export type GetAllGenderDetailsResponseData = ResponseData<GenderModel>;
export type GetAllDepartmentDetailsResponseData =
  ResponseData<DepartmentResponseModel>;
export type GetAllApplicationStatusData = ResponseData<ApplicationStatusModel>;
export type GetUpComingHolidayResponseData = ResponseData<UpComingHolidayModel>;
