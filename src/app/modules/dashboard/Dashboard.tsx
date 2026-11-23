import { Box, Button, Card, CircularProgress, Stack, Typography, alpha } from "@mui/material";
import { Children, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import WidgetsOutlined from "@mui/icons-material/WidgetsOutlined";
import { useAppSelector } from "../../Redux/hooks";
import { hasModuleFeaturePermission } from "../../../utils/common";
import { ModulesName, Permission, Roles } from "../../../utils/enums";
import { usePageData } from "../../Context/PageDataProvider";
import NoticeBoard from "./components/NoticeBoard";
import { EmployeeShortcutsCard } from "./components/EmployeeShortcutsCard";
import { PushNotification } from "./components/PushNotification";
import { DashboardHeader } from "./components/DashboardHeader";
import { KpiCards } from "./components/KpiCards";
import { AttendanceOverviewCard } from "./components/AttendanceOverviewCard";
import { EmployeeTrendCard } from "./components/EmployeeTrendCard";
import { WorkforceMovementCard } from "./components/WorkforceMovementCard";
import { LeaveRequestCohortCard } from "./components/LeaveRequestCohortCard";
import { DepartmentOverviewCard } from "./components/DepartmentOverviewCard";
import { RecentActivitiesCard } from "./components/RecentActivitiesCard";
import { NotificationsCard } from "./components/NotificationsCard";
import { QuickActionsCard } from "./components/QuickActionsCard";
import { UpcomingRemindersCard } from "./components/UpcomingRemindersCard";
import { DashboardOverviewError } from "./components/DashboardOverviewError";
import { useDashboardOverviewQuery } from "./dashboardQueries";
import { dashboardSourceVisibility } from "./dashboardSourceVisibility";

const gap = { xs: 2, md: 2.5 };

/** Smart container that renders full width when only 1 card is present, or 2 equal columns when 2 cards are present. */
const Pair = ({ children }: { children: React.ReactNode }) => {
  const validChildren = Children.toArray(children).filter(Boolean);
  if (validChildren.length === 0) return null;
  const isSingle = validChildren.length === 1;

  return (
    <Box
      sx={{
        display: "grid",
        gap,
        gridTemplateColumns: "minmax(0, 1fr)",
        ...(!isSingle && {
          "@container (min-width: 820px)": {
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          },
        }),
      }}
    >
      {validChildren}
    </Box>
  );
};

export default function Dashboard() {
  const { setPageTitle } = usePageData();
  const user = useAppSelector((state) => state.user.userData);
  const permissions = useAppSelector((state) => state.user.userData?.modulePermission ?? []);

  const access = useMemo(() => {
    const has = (module: ModulesName, permission: Permission) => hasModuleFeaturePermission(module, permission, permissions);
    return {
      employees: has(ModulesName.Employees, Permission.View),
      attendance: permissions.some((p) => p.startsWith("Attendance.") || p.startsWith("AttendanceManagement.")),
      leave: permissions.some((p) => p.startsWith("Leave_Management.") || p.startsWith("LeaveManagement.")),
      offboarding: permissions.some((p) => p.startsWith("Offboarding.")),
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
  }, [setPageTitle]);

  if (!user) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  const showPushPrompt = typeof Notification !== "undefined" && Notification.permission === "default";
  const rightRail = (
    <Stack spacing={gap} sx={{ minWidth: 0 }}>
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
          <DashboardHeader
            fullName={user.fullName || ""}
            subtitleId={subtitleId}
            overview={overview.data}
            onRefresh={access.companyDashboard ? () => { void overview.refetch(); } : undefined}
            isRefreshing={overview.isFetching}
          />
          {main}
        </Stack>
        {rightRail}
      </Box>
    </Box>
  );

  if (!access.companyDashboard) {
    return layout(
      <>
        <EmployeeShortcutsCard />
        {access.noticeBoard && <NoticeBoard />}
      </>,
      "DASHBOARD.SUBTITLE_SELF",
    );
  }

  const loading = overview.isPending;
  const error = overview.isError || (!loading && !overview.data);
  const sourceAvailability = overview.data?.sourceAvailability;
  const sourceVisibility = dashboardSourceVisibility(sourceAvailability);

  // Both server source availability and company role permissions must allow the feature
  const showAttendanceCard = Boolean(access.attendance && sourceVisibility.attendanceBreakdown);
  const showHeadcountCard = Boolean(access.employees && sourceVisibility.headcountTrend);
  const showWorkforceMovement = Boolean(access.employees && access.offboarding && sourceVisibility.workforceMovement);
  const showLeaveRequestCohorts = Boolean(access.leave && sourceVisibility.leaveRequestCohorts);
  const showDepartmentOverview = Boolean(access.employees && sourceVisibility.employees);
  const showRecentActivities = Boolean(access.employees && sourceVisibility.employees);
  const showNoticeBoard = Boolean(access.noticeBoard);

  const showKpiCards = Boolean(
    (access.employees && sourceVisibility.employees) ||
    (access.attendance && sourceVisibility.attendanceKpi) ||
    (access.leave && sourceVisibility.leaveKpi) ||
    (access.jobs && sourceVisibility.openPositions)
  );

  const hasAnyActiveSection = Boolean(
    showKpiCards ||
    showAttendanceCard ||
    showHeadcountCard ||
    showWorkforceMovement ||
    showLeaveRequestCohorts ||
    showDepartmentOverview ||
    showRecentActivities ||
    showNoticeBoard
  );

  return layout(
    <>
      {error && <DashboardOverviewError onRetry={() => { void overview.refetch(); }} isRetrying={overview.isFetching} />}
      {showKpiCards && (
        <KpiCards
          overview={overview.data}
          loading={loading}
          error={error}
          showEmployees={access.employees}
          showAttendance={access.attendance}
          showLeave={access.leave}
          showOpenPositions={access.jobs}
        />
      )}
      {(showAttendanceCard || showHeadcountCard) && (
        <Pair>
          {showAttendanceCard && <AttendanceOverviewCard overview={overview.data} loading={loading} error={error} />}
          {showHeadcountCard && <EmployeeTrendCard trend={overview.data?.headcountTrend} asOfDate={overview.data?.asOfDate} loading={loading} error={error} />}
        </Pair>
      )}
      {showWorkforceMovement && <WorkforceMovementCard trend={overview.data?.workforceMovementTrend} asOfDate={overview.data?.asOfDate} loading={loading} error={error} />}
      {showLeaveRequestCohorts && <LeaveRequestCohortCard trend={overview.data?.leaveRequestCohortTrend} asOfDate={overview.data?.asOfDate} loading={loading} error={error} />}
      {(showDepartmentOverview || showRecentActivities) && (
        <Pair>
          {showDepartmentOverview && <DepartmentOverviewCard />}
          {showRecentActivities && (
            <RecentActivitiesCard
              activities={overview.data?.recentActivities}
              loading={loading}
              error={error}
              canOpenEmployees={access.employees}
            />
          )}
        </Pair>
      )}
      {showNoticeBoard && <NoticeBoard />}
      {!loading && !error && !hasAnyActiveSection && (
        <Card
          sx={{
            p: { xs: 4, md: 6 },
            textAlign: "center",
            borderRadius: "16px",
            border: "1px dashed",
            borderColor: "divider",
            bgcolor: "background.paper",
            boxShadow: "none",
          }}
        >
          <Stack spacing={2} alignItems="center" justifyContent="center">
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "16px",
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <WidgetsOutlined sx={{ fontSize: 36 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
              No Application Modules Active
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480, lineHeight: 1.6 }}>
              All dashboard modules for your organization are currently disabled or uninstalled. An administrator can enable modules like Employees, Attendance, Leave Management, and Recruitment in Application Modules.
            </Typography>
            {user?.roleType === Roles.Administrator && (
              <Button
                component={Link}
                to="/admin/companydetails/modules"
                variant="contained"
                startIcon={<SettingsOutlined />}
                sx={{ mt: 1, textTransform: "none", borderRadius: "10px", fontWeight: 600 }}
              >
                Manage Application Modules
              </Button>
            )}
          </Stack>
        </Card>
      )}
    </>,
  );
}
