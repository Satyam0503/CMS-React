import { Dayjs } from "dayjs";

export interface UserEducationType {
  id?: string;
  title: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  collegeName: string;
  type: string;
}
export interface UserCertificationType {
  id?: string;
  title: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  organizationName: string;
  type: string;
  
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  statusCode?: number;
}

export interface RolesType {
  id: string;
  roleName: string;
  description: string;
  isDeleted: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface CertificationsType {
certificationName: string,
createdAt:string,
employeeId:string,
endDate:string,
id:string,
startDate:string,
title:string,
type:string,
updatedAt:string,
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

// Api respone data types
export interface ResponseData<T> {
  message: string;
  success: boolean;
  methodResult: T;
  // methodResults:T[];
  statusCode?: number;
}

export type GetAllEmployeeResponseData = ResponseData<{
  totalEmployees: number;
  record: EmployeesDataTypes[];
}>;

export type GetAllRolesResponseData = ResponseData<RolesType[]>;

export type GetEmployeeDetailsResponseData = ResponseData<EmployeesDataTypes>;

export type AddUpdateSummaryResponseData = ResponseData<EmployeesDataTypes>;

export type AddUserEducationResponseData = ResponseData<EmployeesDataTypes>;

export type AddCertificationResponseData = ResponseData<EmployeesDataTypes>;
