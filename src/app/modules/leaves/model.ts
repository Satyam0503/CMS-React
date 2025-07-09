import { Dayjs } from "dayjs";
import { LEAVE_TYPE } from "../../../utils/enums";
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
  startDate: string | Dayjs | null;
  endDate: string | Dayjs | null;
  totalDays: number;
  reason: string;
  ReviewedBy?: string;
  status?: number;
}

export type LeaveRequestModel = RequestLeaveModel & {
  employeeName: string;
  profileUrl: string;
  jobRole: string;
};

export type LeaveBalanceFilter = {
  employeeId: string;
  year: string;
  pageNo: number;
  pageSize: number;
};

export type LeaveBalanceRequestModel = {
  id?: string;
  employeeId: string;
  // year: string;
  leaveTypeBalances: LeaveTypeBalance[];
};

export type LeaveTypeBalance = {
  leaveType: number;
  maximumLeave: number;
  remainingLeave?: number;
};

export type GetLeaveTypeResponse = ResponseData<LeaveType>;
