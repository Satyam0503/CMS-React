import { Dayjs } from "dayjs";
import { EmployeeSearchModel, ResponseData } from "../../../utils/common_types";
import { EmployeeModel } from "../employees/models";
import { MultilingualModel } from "../admin/models";

export type UploadProfileResponseModel = ResponseData<string>;

export interface ProfileProps {
  employeeId: string;
}

export type SkillModel = {
  id: string;
  name: string;
};

export type UserSkillsModel = {
  id: string;
  userId: string;
  skills: SkillModel[];
};

export type EditEmployeePayloadModel = Pick<
  EmployeeModel,
  | "firstName"
  | "lastName"
  | "email"
  | "phoneNumber"
  | "dateOfBirth"
  | "dateOfJoining"
  | "personalEmail"
  | "emergencyContact"
  | "bloodGroup"
  | "address"
  | "reportingManager"
  | "department"
  | "jobRole"
  | "employmentType"
> & {
  panNumber: string | null;
  bankAccountNumber: number | null;
  customAttributeList: {
    customAttributeId: string;
    customAttributeValueId: string;
  }[];
};

export type EmployeeCustomAttribute = {
  customAttributeId: string;
  customAttributeValueId: string;
  customAttributeTitle: Record<string, string>;
  customAttributeValueTitle: Record<string, string>;
};

export type EmployeeByIdResponse = EmployeeModel & {
  departmentTitle: null | Record<string, string>;
  reportingManagerName: string | null;
  jobRoleTitle: null | Record<string, string>;
  customAttributes: EmployeeCustomAttribute[];
  panNumber: string | null;
  bankAccountNumber: number | null;
};

export type NotificationModel = {
  userNotificationId: string;
  isRead: boolean;
  body: string;
  sentDateTime: string;
  title: string;
  targetId: string | null;
  sentBy: string;
  notificationTypes: number;
};

export type NotificationRequestType = "all" | "unread";

export type NotificationRequestPayload = {
  type: NotificationRequestType;
  pageNo: number;
  records: number;
};

export type GetNotificationResponseModel = {
  notificationList: NotificationModel[];
  all: number;
  unread: number;
};

export type WorkHistoryModel = {
  workHistoryId: string;
  userId: string;
  organisationName: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  jobRole: string;
  jobLocation: string;
};

export type UserCertificationModel = {
  certificationTitle: string;
  organisationName: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  mode: string;
  userId?: string;
  certificationId?: string;
};
export interface UserEducationModel {
  educationId?: string;
  userId: string;
  educationTitle: string;
  collegeName: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  type: string;
}

export type UserSummaryModel = {
  userId: string;
  summaryId: string;
  summary: string;
};

export type ChangePasswordPayload = {
  oldPassword: string;
  newPassword: string;
  confirmPassword?: string;
};
export type NotificationPreferences = {
  BirthdayNotification: boolean;
  WorkAnniversaries: boolean;
  LeaveStatusUpdate: boolean;
  Notice: boolean;
  HolidayReminder: boolean;
};

export type EmployeeResponseData = ResponseData<EmployeeByIdResponse>;
export type GetSkillListResponseModel = ResponseData<SkillModel>;
export type NotificationResponseModel =
  ResponseData<GetNotificationResponseModel>;
export type UserSkillsResponseData = ResponseData<UserSkillsModel>;
export type WorkHistoryResponseModel = ResponseData<WorkHistoryModel>;
export type GetCollegeListResponseModel = ResponseData<string>;

export type EmployeeSearchResponseModel = ResponseData<EmployeeSearchModel>;
export type CertificationResponseData = ResponseData<UserCertificationModel>;
export type UserEducationResponseData = ResponseData<UserEducationModel>;
export type UserSummaryResponseData = ResponseData<UserSummaryModel>;
