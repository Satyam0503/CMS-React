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
  employmentStatus?: "Active" | "NoticePeriod" | "Suspended" | "Resigned" | "Terminated" | string;
  lastWorkingDate?: string | null;
  availabilityStatus?: string;
  accountStatus?: string;
  payrollStatus?: string;
  offboardingStatus?: string;
  formerPortalStatus?: string;
  alumniStatus?: string;
  availabilityExpectedReturnDate?: string | null;
  lifecycleVersion?: number;
}

export interface EmployeeFilterModel {
  departmentId: string[];
  gender: string[];
  employmentStatus?: "Active" | "NoticePeriod" | "ExEmployees" | "All";
  availabilityStatus?: string;
}

export type InitiateEmployeeExitRequest = {
  employeeUserId: string;
  exitType: "Resigned" | "Terminated" | "Retired" | "ContractEnded" | "Deceased";
  lastWorkingDate: string;
  reason?: string;
  notes?: string;
};

export type ChangeEmployeeAvailabilityRequest = {
  employeeUserId: string;
  availabilityStatus: string;
  version: number;
  effectiveFromUtc: string;
  expectedReturnDate?: string | null;
  reasonCode?: string;
  reason?: string;
};

export type ChangeEmployeeLifecycleDimensionRequest = {
  employeeUserId: string;
  dimension: "AccountStatus" | "PayrollStatus" | "AlumniStatus";
  value: string;
  version: number;
  effectiveFromUtc: string;
  reason?: string;
};

export interface GetAllEmployeePayloadModel {
  name: string;
  pageNo: number;
  records: number;
  departmentId: string[];
  gender: string[];
  employmentStatus?: "Active" | "AttendanceRoster" | "NoticePeriod" | "ExEmployees" | "All";
  availabilityStatus?: string;
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
  employmentStatus?: "Active" | "NoticePeriod" | "Suspended" | "Resigned" | "Terminated" | string;
  availabilityStatus?: string;
  accountStatus?: string;
  payrollStatus?: string;
  alumniStatus?: string;
  lastWorkingDate?: string | null;
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
  // Legacy salary projections may predate account linking; employee context
  // still supplies the required account ID when creating a salary revision.
  userId: string | null;
  employeeId: string;
  basicPay: number;
  hra: number;
  otherAllowance: number;
  otherAllowances?: number;
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

export type CreateEmployeeSalary = Omit<Pick<
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
>, "userId"> & { userId: string };

export type BulkImportEmployeeModel = {
  empId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  jobRole: string;
  gender: string;
  dateOfJoining: string;
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
