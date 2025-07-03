import { Dayjs } from "dayjs";
import { LEAVE_TYPE } from "../../../utils/enums";

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
