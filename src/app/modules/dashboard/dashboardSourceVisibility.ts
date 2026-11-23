import { DashboardSourceAvailability } from "./model";

/** Keeps dashboard cards aligned with server-enforced company source-module switches. */
export const dashboardSourceVisibility = (availability?: DashboardSourceAvailability) => {
  const enabled = (module: keyof DashboardSourceAvailability) => availability?.[module] !== false;
  const employees = enabled("employees");
  const attendance = enabled("attendance");
  const leaveManagement = enabled("leaveManagement");
  const jobs = enabled("jobs");
  const offboarding = enabled("offboarding");

  return {
    employees,
    attendanceKpi: employees && attendance,
    leaveKpi: employees && leaveManagement,
    attendanceBreakdown: employees && attendance && leaveManagement,
    headcountTrend: employees,
    workforceMovement: employees && offboarding,
    leaveRequestCohorts: leaveManagement,
    openPositions: jobs,
  };
};
