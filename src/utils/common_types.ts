import { Dayjs } from "dayjs";
import { ReactNode } from "react";
import { UserSummaryModel } from "../app/modules/users/userservices";

export interface ApiResponse {
  success: boolean;
  message: string;
  statusCode?: number;
}

export interface UserModel {
  userId: string;
  companyId: string;
  role: string;
  firstName: string;
  lastName: string;
  fullName: string;
  permissions: any[];
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
  reportingManager: string;
  teamLead: string;
  phoneNumber: string;
  bloodGroup: string;
  address: string;
  jobRole: string;
  password: string;
  dateOfJoining: Dayjs | null;
  personalEmail: string;
  emergencyContact: string;
  status: string | boolean;
  isEmailVerified?: boolean;
}

export interface RoleModel {
  rolesId: string;
  titles: string;
  description: string;
  isNotEditable: boolean;
  isDefault: boolean;
  userRoles: [string];
}

export interface JobModal {
  jobId: string;
  companyId?: string;
  title: string;
  vacancies: number;
  jobType: string;
  status: boolean;
  description: string;
}

export interface UserEducationModel {
  educationId: string;
  userId: string;
  educationTitle: string;
  collegeName: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  type: string;
}

export type UserCertificationModel = {
  certificationId: string;
  certificationTitle: string;
  organisationName: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  mode: string;
};

export type HolidayType = {
  id: string;
  title: string;
  description: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  type: string;
};

export type NoticeModel = {
  id: string;
  target: string;
  type: string;
  group: string;
  message: string;
};

export interface RolesType {
  id: string;
  roleName: string;
  description: string;
  accessToApp?: string;
  isDeleted?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export type ColumnListTypes = {
  id: string;
  label: string;
  align?: "center" | "left" | "right" | "inherit" | "justify";
  minWidth?: number;
  build?: any;
  // fontSize?: string;

  format?: (value: any) => any;
  avatarCell?: (row: any) => ReactNode;
};

export interface ApplicantModel {
  applicantId: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vacancyId: string;
  vacancyName:string;
  experience: number;
  resume?: null | File;
}

export type Applicant = Omit<ApplicantModel, "resume"> & {
  statusName: string;
  status: number;
  activityTypeName: string;
  activityType: number;
  applyDate: string
  updateDate: string
  resumeUrl: string;
  fullApplicantResumePath:string
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

export type GetUserDetailsResponseData = ResponseData<UserModel>;

export type GetAllEmployeeResponseData = ResponseData<EmployeeModel>;

export type EmployeeResponseData = ResponseData<EmployeeModel>;

export type AddEmployeeResponseData = ResponseData<EmployeeModel>;

export type GetAllRolesResponseData = ResponseData<RoleModel>;

export type JobsResponseData = ResponseData<JobModal>;

export type SkillsResponseData = ResponseData<JobModal>;

export type UserSummaryResponseData = ResponseData<UserSummaryModel>;

export type UserEducationResponseData = ResponseData<UserEducationModel>;

export type ApplicantsResponseData = ResponseData<Applicant>;

export type CertificationResponseData = ResponseData<UserCertificationModel>;
