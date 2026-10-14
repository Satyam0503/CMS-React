import { Dayjs } from "dayjs";
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

export type UpComingHolidayAndEventModel = {
  holiday: CalendarModel[];
  event: CalendarModel[];
};
export type CalendarModel = {
  id: string;
  name: string;
  date: string;
  description: string;
  type: number;
  imageUrl: string | null;
};
export type UpcomingCelebration = {
  birthday: CelebrationModule[];
  workAnniversary: CelebrationModule[];
};

export type CelebrationModule = {
  employeeId: string;
  employeeName: string;
  profileUrl: string | null;
  jobRole: Record<string, string>;
  date: Dayjs;
  ordinal: number;
};

export type GetAllGenderDetailsResponseData = ResponseData<GenderModel>;
export type GetAllDepartmentDetailsResponseData =
  ResponseData<DepartmentResponseModel>;
export type GetAllApplicationStatusData = ResponseData<ApplicationStatusModel>;
export type GetUpComingHolidayEvent =
  ResponseData<UpComingHolidayAndEventModel>;
export type GetUpComingCelebration = ResponseData<UpcomingCelebration>;
