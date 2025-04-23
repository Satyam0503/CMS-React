import { Dayjs } from "dayjs";
import { ReactNode } from "react";
import { Modules, ModulesName, ModulesTitles } from "./enums";
import {
  ApplicationFilterModel,
  JobsFilterModel,
  ProcessLogFilterModel,
} from "../app/modules/recruitment/models";

export interface ApiResponse {
  success: boolean;
  message: string;
  statusCode?: number;
}
export interface CreatePasswordModel {
  newPassword: string;
  statusNumber: string;
}

export interface UserModel {
  userId: string;
  companyName: string;
  firstName: string;
  lastName: string;
  fullName: string;
  profileImage: string;
  modulePermission: string[];
}

export type UserSummaryModel = {
  userId: string;
  summaryId: string;
  summary: string;
};

export interface ModulePermissoinModel {
  moduleName: string;
  moduleConstant: string;
  permissions: PermissionModel[];
}

export interface PermissionModel {
  permissionName: string;
  rolePermissionId: string;
  modulePermissionId: number;
  rolesId: string;
  hasAccess: boolean;
  permissionConstant: string;
}

export interface EmployeeModel {
  userId: string;
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  companyId: string;
  roleId: string;
  employeeId: string;
  department: string;
  dateOfBirth: Dayjs | null;
  reportingManager: string | null;
  teamLead: string | null;
  phoneNumber: string;
  bloodGroup: string;
  address: string;
  jobRole: string;
  dateOfJoining: Dayjs | null;
  personalEmail: string;
  emergencyContact: string;
  status: string | boolean;
  isEmailVerified?: boolean;
  password?: string | null;
  profileUrl?: string;
  fullProfileUrl?: string;
  birthDayThisYear?: Dayjs | string;
}
export interface UserEducationModel {
  educationId?: string;
  userId: string;
  educationTitle: string;
  collegeName: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  type: string;
}

export type UserCertificationModel = {
  certificationTitle: string;
  organisationName: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  mode: string;
  userId?: string;
  certificationId?: string;
};



export type HolidayType = {
  id: string;
  title: string;
  description: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  type: string;
};

/* export type NoticeModel = {
  id: string;
  target: string;
  type: string;
  group: string;
  message: string;
};
*/

// By Rajdeep
export type NoticeModel = {
  id: string;
  name: string;
  date: Dayjs | null;
  type: string;
  message: string;
};

export type ProcessLogModel = {
  processId: string;
  applicantName: string;
  companyId: string;
  userId: string;
  jobRole: string;
  commentedOn: string;
  comments: string;
  commentedBy: string;
};
export type LeavesModel = {
  id: string;
  target: string;
  type: string;
  group: string;
  message: string;
};
export type AttendanceModel = {
  id: string;
  target: string;
  type: string;
  group: string;
  message: string;
};

export interface ResetPasswordModel {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  type: string;
}

export type ColumnListTypes = {
  id: string;
  label: string;
  align?: "center" | "left" | "right" | "inherit" | "justify";
  minWidth?: number;
  width?: number;
  build?: any;
  sorting?: boolean;
  format?: (value: any) => any;
  avatarCell?: (row: any) => ReactNode;
  permission?: boolean;
};

// Api respone data types
export interface ResponseData<T> {
  message: string;
  success: boolean;
  totalRecords: number;
  statusCode: number;
  methodResult: T;
  methodResults: T[];
}

export interface SideBarTabListProps {
  id: Modules;
  title: ModulesTitles;
  constant: ModulesName;
  route: string;
  icon: JSX.Element;
  hasSubTabs?: boolean;
  subTabs?: Omit<SideBarTabListProps, "subTabs" | "hasSubTabs">[];
}

export interface FiltersType {
  application: ApplicationFilterModel | null;
  jobs: JobsFilterModel | null;
  processLog: ProcessLogFilterModel | null;
}

export type WithChildren = {
  children?: ReactNode;
};

export interface BaseModel {
  companyId: string;
  createdBy: string;
  createdDate: string;
  updatedBy: string;
  updatedDate: string;
}

export interface TabModel {
  to: string;
  title: string;
  icon: JSX.Element;
  tabId: number;
}

export type GetUserDetailsResponseData = ResponseData<UserModel>;

export type EmployeeResponseData = ResponseData<EmployeeModel>;

export type AddEmployeeResponseData = ResponseData<EmployeeModel>;

export type UserSummaryResponseData = ResponseData<UserSummaryModel>;


export type UserEducationResponseData = ResponseData<UserEducationModel>;

export type CertificationResponseData = ResponseData<UserCertificationModel>;

export type GetProcessLogResponseModel = ResponseData<ProcessLogModel>;
