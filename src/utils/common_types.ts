import { Dayjs } from "dayjs";
import { ReactNode } from "react";

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

export interface UserEducationType {
  id?: string;
  title: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  collegeName: string;
  type: string;
}
export type UserCertificationType = Omit<UserEducationType, "collegeName"> & {
  organizationName: string;
};

export type HolidayType = Omit<UserEducationType, "collegeName"> & {
  description: string;
};

export type NoticeType = {
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

export interface CertificationsType {
  certificationName: string;
  createdAt: string;
  employeeId: string;
  endDate: string;
  id: string;
  startDate: string;
  title: string;
  type: string;
  updatedAt: string;
}

export interface EmployeesDataTypes {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  role: string;
  employeeId: string;
  department: string;
  dateOfBirth: Dayjs | null;
  reportingManager: string;
  teamLead: string;
  phoneNumber: string;
  bloodGroup: string;
  status: string;
  address: string;
  jobRole: string;
  dateOfJoining: Dayjs | null;
  personalEmail: string;
  emergencyContact: string;
  skills?: null | string[];
  summary?: string | null;
  createdAt?: string;
  updatedAt?: string;
  Education?: any[];
  Certifications?: CertificationsType[];
  Employements?: any[];
  languagesKnown?: string;
  profilePicture?: string | File | null;
}

export type ColumnListTypes = {
  id: string;
  label: string;
  align?: "center" | "left" | "right" | "inherit" | "justify";
  minWidth?: number;
  build?: any;
  format?: (value: any) => any;
  avatarCell?: (row: any) => ReactNode;
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

export type AddEmployeeResponseData = ResponseData<EmployeeModel>;

export type GetAllRolesResponseData = ResponseData<RoleModel>;

export type GetEmployeeDetailsResponseData = ResponseData<EmployeesDataTypes>;

export type AddUpdateSummaryResponseData = ResponseData<EmployeesDataTypes>;

export type AddUserEducationResponseData = ResponseData<EmployeesDataTypes>;

export type AddCertificationResponseData = ResponseData<EmployeesDataTypes>;
