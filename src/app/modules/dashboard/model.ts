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
  | "salaryRevised"
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

export type DashboardOverview = {
  totalEmployees: number;
  totalEmployeesChangePercent: number | null;
  presentToday: number;
  onLeaveToday: number;
  absentToday: number;
  isWorkingDay: boolean;
  openPositions: number;
  headcountTrend: HeadcountPoint[];
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
