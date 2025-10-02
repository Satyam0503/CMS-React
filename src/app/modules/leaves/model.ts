import { Dayjs } from "dayjs";
import { LEAVE_REQUEST_STATUS, LEAVE_TYPE } from "../../../utils/enums";
import { ResponseData } from "../../../utils/common_types";

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
  leaveType: LEAVE_TYPE;
  isHalfDay: boolean;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  totalDays: number;
  reason: string;
  reviewedBy?: string;
  status?: number;
  employeeId: string;
}

export type LeaveRequestModel = RequestLeaveModel & {
  employeeName: string;
  profileUrl: string | null;
  jobRole: null | Record<string, string>;
};

export type LeaveRequestsFilter = {
  employeeId?: string;
  startDate?: Dayjs | string | null;
  endDate?: Dayjs | string | null;
  leaveType?: LEAVE_TYPE[];
  status?: LEAVE_REQUEST_STATUS[];
  pageNo: number;
  pageSize: number;
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

export type LeaveBalanceRequestModel = {
  id?: string;
  employeeId: string;
  leaveTypeBalances: (LeaveTypeBalance | null)[];
};

export type EmployeeLeaveTypeBalance = {
  leaveType: number;
  isHalfDay: boolean;
  minAdvanceNoticeDate: number;
  maximumLeave: number;
  remainingLeave: number;
};

export type GetLeaveTypeResponse = ResponseData<LeaveType>;
export type GetLeaveBalanceResponse = ResponseData<LeaveBalance>;
export type GetLeaveRequestesResponse = ResponseData<LeaveRequestModel>;
export type GetEmployeeLeaveBalanceResponse =
  ResponseData<EmployeeLeaveTypeBalance>;
