import { Box, CircularProgress, Stack } from "@mui/material";
import { useEffect, useMemo } from "react";
import { useAppSelector } from "../../Redux/hooks";
import { hasModuleFeaturePermission } from "../../../utils/common";
import { ModulesName, Permission, Roles } from "../../../utils/enums";
import { usePageData } from "../../Context/PageDataProvider";
import NoticeBoard from "./components/NoticeBoard";
import { PushNotification } from "./components/PushNotification";
import { DashboardHeader } from "./components/DashboardHeader";
import { KpiCards } from "./components/KpiCards";
import { AttendanceOverviewCard } from "./components/AttendanceOverviewCard";
import { EmployeeTrendCard } from "./components/EmployeeTrendCard";
import { DepartmentOverviewCard } from "./components/DepartmentOverviewCard";
import { RecentActivitiesCard } from "./components/RecentActivitiesCard";
import { NotificationsCard } from "./components/NotificationsCard";
import { QuickActionsCard } from "./components/QuickActionsCard";
import { UpcomingRemindersCard } from "./components/UpcomingRemindersCard";
import { useDashboardOverviewQuery } from "./dashboardQueries";

const gap = { xs: 2, md: 2.5 };

/** Two equal cards side by side once the main column (a size container) is wide enough. */
const Pair = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ display: "grid", gap, gridTemplateColumns: "minmax(0, 1fr)", "@container (min-width: 820px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" } }}>
    {children}
  </Box>
);

export default function Dashboard() {
  const { setPageTitle } = usePageData();
  const user = useAppSelector((state) => state.user.userData);
  const permissions = useAppSelector((state) => state.user.userData?.modulePermission ?? []);

  const access = useMemo(() => {
    const has = (module: ModulesName, permission: Permission) => hasModuleFeaturePermission(module, permission, permissions);
    return {
      employees: has(ModulesName.Employees, Permission.View),
      companyDashboard:
        user?.roleType === Roles.Administrator ||
        user?.roleType === Roles.HRManager ||
        user?.roleType === Roles.HRExecutive ||
        has(ModulesName.Dashboard, Permission.ViewAll),
      jobs: has(ModulesName.Jobs, Permission.View),
      noticeBoard: has(ModulesName.NoticeBoard, Permission.View),
      calendar: permissions.some((p) => p.startsWith("Calendar.")),
      quick: {
        addEmployee: has(ModulesName.Employees, Permission.Create),
        applyLeave: permissions.some((p) => p.startsWith("Leave_Management.") || p.startsWith("LeaveManagement.")),
        runPayroll: has(ModulesName.PayRoll, Permission.View),
        postJob: has(ModulesName.Jobs, Permission.Create),
      },
    };
  }, [permissions, user?.roleType]);

  const overview = useDashboardOverviewQuery(Boolean(user) && access.companyDashboard);

  useEffect(() => {
    setPageTitle("");
  }, []);

  if (!user) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  const showPushPrompt = typeof Notification !== "undefined" && Notification.permission === "default";
  const rightRail = (
    <Stack spacing={gap}>
      {showPushPrompt && <PushNotification />}
      <NotificationsCard />
      <QuickActionsCard access={access.quick} />
      <UpcomingRemindersCard showCalendar={access.calendar} />
    </Stack>
  );
  const layout = (main: React.ReactNode, subtitleId?: string) => (
    <Box className="dashboard-overview" sx={{ pb: 4 }}>
      <Box
        sx={{
          display: "grid",
          gap,
          gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) minmax(300px, 360px)" },
          alignItems: "start",
        }}
      >
        <Stack spacing={gap} sx={{ minWidth: 0, containerType: "inline-size" }}>
          <DashboardHeader fullName={user.fullName || ""} subtitleId={subtitleId} />
          {main}
        </Stack>
        {rightRail}
      </Box>
    </Box>
  );

  if (!access.companyDashboard) {
    return layout(access.noticeBoard ? <NoticeBoard /> : null, "DASHBOARD.SUBTITLE_SELF");
  }

  const loading = overview.isPending;
  const error = overview.isError || (!loading && !overview.data);

  return layout(
    <>
      <KpiCards overview={overview.data} loading={loading} showOpenPositions={access.jobs} />
      <Pair>
        <AttendanceOverviewCard overview={overview.data} loading={loading} error={error} />
        <EmployeeTrendCard trend={overview.data?.headcountTrend} loading={loading} error={error} />
      </Pair>
      <Pair>
        {access.employees && <DepartmentOverviewCard />}
        <RecentActivitiesCard activities={overview.data?.recentActivities} loading={loading} error={error} canOpenEmployees={access.employees} />
      </Pair>
      {access.noticeBoard && <NoticeBoard />}
    </>,
  );
}
