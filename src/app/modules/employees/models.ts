import { Dayjs } from "dayjs";
import { ResponseData } from "../../../utils/common_types";
import { EmployeeByIdResponse } from "../users/models";

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
  "employeeId" | "firstName" | "lastName" | "email"
>;

export type InviteEmployeeResponse = InviteNewEmployeeModel & {
  userId: string;
};

export type EmployeeLeaveBalance = Array<{
  leaveBalanceId?: string;
  employeeId: string;
  leavePolicyId: string;
  balance: number;
}>;

export type EditEmployeeResponseData = ResponseData<EmployeeByIdResponse>;

export type GetAllEmployeeResponseData =
  ResponseData<GetAllEmployeeResponseModel>;
