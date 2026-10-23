import { Dayjs } from "dayjs";
import { LEAVE_REQUEST_STATUS, LEAVE_TYPE } from "../../../utils/enums";
import {
  Nullable,
  PaginationModel,
  ResponseData,
} from "../../../utils/common_types";

export interface LeaveType {
  leaveTypeId?: string;
  isHalfDay: boolean;
  minAdvanceNoticeDate: number;
  maxLeaveDays: number;
  isActive: boolean;
  leaveType: LEAVE_TYPE;
}

export interface RequestLeaveModel {
  leaveRequestId?: string;
  userId: string;
  leavePolicyId: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  isHalfDay: boolean;
  // Half-day requests must identify their segment so leave and WFH can share
  // one business date without overwriting each other.
  halfDayPeriod?: "FIRST_HALF" | "SECOND_HALF";
  reason: string;
}

export type MyLeaveRequestModel = Required<RequestLeaveModel> & {
  leaveRequestId: string;
  totalDays: number;
  reviewedBy: string;
  comment: string;
  status: number;
  leavePolicyName: string;
  code: string;
};

export type LeaveRequestModel = Required<MyLeaveRequestModel> & {
  employeeName: string;
  profileUrl: string | null;
  jobRole: null | Record<string, string>;
  employeeId: string;
};

export type LeaveRequestsFilterModel = {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  status: LEAVE_REQUEST_STATUS | null;
};

export type GetLeaveRequestPayLoad = LeaveRequestsFilterModel &
  Nullable<PaginationModel> & {
    employeeId?: string;
  };

export type LeaveBalanceFilter = {
  employeeName?: string;
  year?: string;
  pageNo: number;
  pageSize: number;
};

export type LeaveTypeBalance = {
  leaveType: number;
  maximumLeave: number;
  remainingLeave?: number;
};

export type LeaveBalanceType = LeaveTypeBalance | null;

export type LeaveBalance = {
  id: string;
  employeeName: string;
  employeeId: string;
  profileUrl: string | null;
  jobRole: null | Record<string, string>;
  sickLeave: LeaveBalanceType;
  casualLeave: LeaveBalanceType;
  earnedLeave: LeaveBalanceType;
  maternityLeave: LeaveBalanceType;
  paternityLeave: LeaveBalanceType;
};

export type EmployeeLeaveTypeBalance = {
  leaveBalanceId: string;
  leavePolicyId: string;
  totalAllocated: number;
  taken: number;
  remaining: number;
  name: string;
  code: string;
  description: string;
  paid: boolean;
  minNoticeDays: number;
  halfDayAllowed: boolean;
  weekendInclusive: boolean;
  holidayInclusive: boolean;
  attendanceStatusCode?: string | null;
  fullDayAttendanceStatusCode?: string | null;
  halfDayAttendanceStatusCode?: string | null;
};

export type LeaveRequestApprovalPayload = {
  status: LEAVE_REQUEST_STATUS;
  comment: string;
};

export type LeaveRequestSummary = {
  totalRequests: number;
  leaveStatusSummary: Record<number, number>;
  leaveTypeSummary: {
    leaveTypeCode: string;
    leaveTypeName: string;
    statusValues: Record<number, number>;
  }[];
};

export type MonthlyLeaveTakenSummary = {
  month: number;
  totalLeavesTaken: number;
};

export type LeavePolicyModel = {
  id: string | null;
  name: string;
  code: string;
  description: string | null;
  status: boolean;
  paid: boolean;
  accrualPeriod: number;
  accrualAmount: number;
  maxBalance: number;
  carryOverAllowed: boolean;
  carryOverLimit: number;
  minNoticeDays: number;
  halfDayAllowed: boolean;
  weekendInclusive: boolean;
  holidayInclusive: boolean;
  attendanceStatusCode?: string | null;
  fullDayAttendanceStatusCode?: string | null;
  halfDayAttendanceStatusCode?: string | null;
  applicableTo?: Array<string> | null;
  policyType: 1 | 2 | 3;
  workFromHome?: {
    approvalRequired: boolean;
    approverStrategy: "REPORTING_MANAGER" | "DEPARTMENT_HEAD" | "HR_ADMIN";
    reasonRequired: boolean;
    maxDaysPerWeek?: number | null;
    maxDaysPerMonth?: number | null;
    allowFullDay: boolean;
    allowFirstHalf: boolean;
    allowSecondHalf: boolean;
    allowMixedHalfDayLeave: boolean;
    allowOnWeeklyOff: boolean;
    allowOnHoliday: boolean;
    fullDayAttendanceStatusCode: string;
    halfDayAttendanceStatusCode: string;
    mixedAttendanceStatusCode?: string | null;
    wfhWfoAttendanceStatusCode?: string | null;
    wfhHdAttendanceStatusCode?: string | null;
    useEffectiveOfficeSchedule: boolean;
    fullDayRequiredWorkingMinutes?: number | null;
    halfDayRequiredWorkingMinutes?: number | null;
    breakMinutes: number;
    sameDayCutoffTime?: string | null;
    sameDayGraceMinutes?: number | null;
    allowLateApplicationWithApproval?: boolean;
  } | null;
  lifecycle?: {
    enabled: boolean;
    eventType: "MedicalLeave" | "MaternityLeave" | "PaternityLeave" | "LongTermLeave" | "Sabbatical" | string;
    requiresHrApproval: boolean;
    requiresReason: boolean;
    requiresDocument: boolean;
    requiresExpectedReturnDate: boolean;
    defaultAccountStatus?: "Active" | "TemporarilyDisabled" | string | null;
    defaultPayrollStatus?: "Active" | "Hold" | "Paused" | string | null;
    effectiveFromUtc?: string | null;
  } | null;
};

export type EmployeeLeaveBalanceFilter = {
  employeeName: string;
  pageNo: number;
  pageSize: number;
  leavePolicies: Array<string>;
};

export type EmployeeLeaveInfo = {
  leaveBalanceId: string;
  leavePolicyId: string;
  leavePolicyName: string;
  leavePolicyCode: string;
  totalAllocated: number;
  taken: number;
  remaining: number;
  version: number;
};

export type EmployeeLeaveBalanceData = {
  employeeId: string;
  employeeName: string;
  employeeCode: string | null;
  designation: Record<string, string>;
  profilePicture: string | null;
  leaveBalances: Array<EmployeeLeaveInfo>;
};

// export type LeavePolicyData = {
//   message : string,
//   methodResult : null,
//   methodResults: Array<LeavePolicyUpdateModel>,
//   statusCode : number,
//   success : boolean,
//   totalRecords : number
// }

export type GetLeaveTypeResponse = ResponseData<LeaveType>;
export type GetLeaveBalanceResponse = ResponseData<LeaveBalance>;
export type GetLeaveRequestsResponse = ResponseData<LeaveRequestModel>;
export type GetMyLeaveRequestsResponse = ResponseData<MyLeaveRequestModel>;
export type GetLeaveRequestsSummary = ResponseData<LeaveRequestSummary>;

export type GetEmployeeLeaveBalanceResponse =
  ResponseData<EmployeeLeaveTypeBalance>;
