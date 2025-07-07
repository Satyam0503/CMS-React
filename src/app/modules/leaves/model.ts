import { Dayjs } from "dayjs";
import { LEAVE_TYPE } from "../../../utils/enums";
import { ResponseData } from "../../../utils/common_types";

export interface LeaveType {
  leaveTypeId?: string;
  isHalfDay: boolean;
  minAdvanceNoticeDate: number;
  isActive: boolean;
  leaveTypes: LEAVE_TYPE;
}

export interface RequestLeaveModel {
  leaveRequestId?: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string | Dayjs | null;
  endDate: string | Dayjs | null;
  totalDays: number;
  reason: string;
  approvedBy: string;
  status: number;
}

export type LeaveRequestModel = RequestLeaveModel & {
  employeeName: string;
  profileUrl: string;
  jobRole: string;
};

export type GetLeaveTypeResponse = ResponseData<LeaveType>;
