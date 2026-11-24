import { Dayjs } from "dayjs";
import { ResponseData } from "../../../utils/common_types";

export interface DepartmentResponseModel {
  label: Record<string, string>;
  departmentId: string;
  employeeCount: number;
}

export type DashboardActivityType =
  | "joined"
  | "leaveApproved"
  | "exitInitiated"
  | "jobPosted";

export type DashboardActivity = {
  type: DashboardActivityType;
  employeeId?: string | null;
  employeeName: string;
  detail?: string | null;
  occurredAt: string;
};

export type HeadcountPoint = {
  /** yyyy-MM */
  month: string;
  count: number;
};

export type WorkforceMovementPoint = {
  /** yyyy-MM */
  month: string;
  hires: number;
  exits: number;
  netChange: number;
};

export type LeaveRequestCohortPoint = {
  /** yyyy-MM; this is submission month and the counts show current status. */
  month: string;
  totalRequests: number;
  pending: number;
  approved: number;
  rejected: number;
  withdrawn: number;
  otherStatus: number;
};

export type DashboardSourceAvailability = {
  employees: boolean;
  attendance: boolean;
  leaveManagement: boolean;
  jobs: boolean;
  offboarding: boolean;
};

export type DashboardOverview = {
  definitionVersion?: string;
  asOfDate?: string | null;
  timeZone?: string;
  generatedAtUtc?: string | null;
  sourceAvailability?: DashboardSourceAvailability;
  totalEmployees: number;
  totalEmployeesChangePercent: number | null;
  presentToday: number;
  onLeaveToday: number;
  absentToday: number;
  attendanceBreakdown?: {
    definitionVersion?: string;
    expectedEmployees: number;
    presentOnly: number;
    leaveOnly: number;
    presentAndOnLeave: number;
    explicitlyAbsent: number;
    otherStatus: number;
    unreported: number;
  } | null;
  isWorkingDay: boolean;
  openPositions: number;
  headcountTrend: HeadcountPoint[];
  workforceMovementTrend?: WorkforceMovementPoint[];
  leaveRequestCohortTrend?: LeaveRequestCohortPoint[];
  recentActivities: DashboardActivity[];
};

export type UpComingHolidayAndEventModel = {
  holiday: CalendarModel[];
  event: CalendarModel[];
};
export type CalendarModel = {
  id: string;
  name: string;
  date: string;
  description: string;
  type: number;
  imageUrl: string | null;
};
export type UpcomingCelebration = {
  birthday: CelebrationModule[];
  workAnniversary: CelebrationModule[];
};

export type CelebrationModule = {
  employeeId: string;
  employeeName: string;
  profileUrl: string | null;
  jobRole: Record<string, string>;
  date: Dayjs | string;
  ordinal: number;
};

export type GetDashboardOverviewData = ResponseData<DashboardOverview>;
export type GetAllDepartmentDetailsResponseData =
  ResponseData<DepartmentResponseModel>;
export type GetUpComingHolidayEvent =
  ResponseData<UpComingHolidayAndEventModel>;
export type GetUpComingCelebration = ResponseData<UpcomingCelebration>;
