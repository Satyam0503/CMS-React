import { Dayjs } from "dayjs";
import { ResponseData } from "../../../utils/common_types";
import {
  EmployeeByIdResponse,
  EmployeeSalaryByIdResponse,
} from "../users/models";

export interface GetAllEmployeeResponseModel {
  userId: string;
  fullName: string;
  email: string;
  gender: string;
  employeeId: string;
  jobRole: null | Record<string, string>;
  department: null | Record<string, string>;
  phoneNumber: string | null;
  fullProfileUrl: string | null;
  dateOfBirth: string | null;
  dateOfJoining?: string | null;
  isVerified: boolean;
}

export interface EmployeeFilterModel {
  departmentId: string[];
  gender: string[];
}

export interface GetAllEmployeePayloadModel {
  name: string;
  pageNo: number;
  records: number;
  departmentId: string[];
  gender: string[];
}
export interface EmployeeModel {
  userId: string;
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  roleId: string;
  employeeId: string;
  department: string | null;
  dateOfBirth: Dayjs | null;
  reportingManager: string | null;
  phoneNumber: string | null;
  bloodGroup: string | null;
  address: string | null;
  jobRole: string | null;
  employmentType: number | null;
  dateOfJoining: Dayjs | null;
  personalEmail: string | null;
  emergencyContact: string | null;
  status: string | boolean;
  isEmailVerified?: boolean;
  profileUrl?: string;
  birthDayThisYear?: Dayjs | string;
}

export type InviteNewEmployeeModel = Pick<
  EmployeeModel,
  "employeeId" | "firstName" | "lastName" | "email" | "reportingManager"
> & { scheduleId?: string };

export type InviteEmployeeResponse = InviteNewEmployeeModel & {
  userId: string;
};

export type EmployeeLeaveBalance = Array<{
  leaveBalanceId?: string;
  employeeId: string;
  leavePolicyId: string;
  totalAllocated: number;
}>;

export type EditEmployeeResponseData = ResponseData<EmployeeByIdResponse>;

export type CreateEmployeeSalaryResponseData =
  ResponseData<EmployeeSalaryByIdResponse>;
export type GetAllEmployeeResponseData =
  ResponseData<GetAllEmployeeResponseModel>;

export interface SalaryModel {
  userId: string;
  employeeId: string;
  basicPay: number;
  hra: number;
  otherAllowance: number;
  lta: number;
  bonus: number;
  healthInsurance: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  ctc: number;
  effectiveFrom: Dayjs;
  effectiveTo: Dayjs | null;
  paymentFrequency: string;
  currency: string;
  status: boolean;
}

export type CreateEmployeeSalary = Pick<
  SalaryModel,
  | "userId"
  | "employeeId"
  | "basicPay"
  | "hra"
  | "otherAllowance"
  | "lta"
  | "bonus"
  | "healthInsurance"
  | "totalDeductions"
  | "effectiveFrom"
  | "effectiveTo"
  | "paymentFrequency"
  | "status"
>;

export type BulkImportEmployeeModel = {
  empId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  jobRole: string;
  gender: string;
};

export type BulkImportEmployeesRequest = {
  employees: BulkImportEmployeeModel[];
};

export type BulkImportEmployeeResult = {
  rowNumber?: number;
  empId?: string;
  email?: string;
  status?: string;
  message?: string;
  createdUserId?: string;
};

export type BulkImportEmployeesResponse = {
  total?: number;
  createdCount?: number;
  failedCount?: number;
  results?: BulkImportEmployeeResult[];
};
