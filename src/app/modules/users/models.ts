import dayjs, { Dayjs } from "dayjs";
import { EmployeeModel, ResponseData } from "../../../utils/common_types";

export type UploadProfileResponseModel = ResponseData<string>

export interface ProfileProps {
  employeeId: string;
}

export type SkillModel = {
  id: string;
  name: string;
}

export type UserSkillsModel = {
  id: string;
  userId: string;
  skills: SkillModel[];
};

export type EditEmployeePayloadModel = Pick<EmployeeModel,
  "firstName" | "lastName" | "email" | "phoneNumber" | "dateOfBirth" | "dateOfJoining" | "personalEmail" | "emergencyContact"
  | "bloodGroup" | "address" | "reportingManager" | "teamLead" | "department" | "jobRole">



export type EmployeeByIdResponse = EmployeeModel & {
  departmentName: string | null;
  reportingManagerName: string | null;
  teamLeadName: string | null;
}

export type NotificationModel = {
  userNotificationId: string,
  isRead: boolean,
  title: string,
  sentDateTime: string,
  sentBy: string,
  notificationTypes: number
}

export type WorkHistoryModel = {
  workHistoryId: string,
  userId: string,
  organisationName: string,
  startDate: Dayjs | null,
  endDate: Dayjs | null,
  jobRole: string,
  jobLocation: string
}


export type EmployeeResponseData = ResponseData<EmployeeByIdResponse>;
export type GetSkillListResponseModel = ResponseData<SkillModel>;
export type NotificationResponseModel = ResponseData<NotificationModel>;
export type UserSkillsResponseData = ResponseData<UserSkillsModel>;
export type WorkHistoryResponseModel = ResponseData<WorkHistoryModel>;
