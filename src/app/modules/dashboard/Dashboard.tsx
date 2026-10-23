import { Box, CircularProgress, Grid, Stack } from "@mui/material";
import { useAppSelector } from "../../Redux/hooks";
import React, { useEffect, useMemo } from "react";
import { EmployeeChart } from "./components/EmployeeChart";
import OpenPositions from "./components/OpenPositions";
import { ApplicationsChart } from "./components/ApplicationsChart";
import { DepartmentChart } from "./components/DepartmentChart";
// import EmployeePerformance from "./components/EmployeePerformance";
import EmpOnLeave from "./components/EmpOnLeave";
import NoticeBoard from "./components/NoticeBoard";
import Help from "./components/Help";
import { hasModuleFeaturePermission } from "../../../utils/common";
import { ModulesName, Permission, Roles } from "../../../utils/enums";
import { DashboardHeader } from "./components/DashboardHeader";
import { UpComingCelebration } from "./components/UpcomingCelebration";
import { PushNotification } from "./components/PushNotification";
import { UpComingHolidayAndEvents } from "./components/UpComingHolidayAndEvent";
import { usePageData } from "../../Context/PageDataProvider";

// Main Dashboard Component
export default function Dashboard() {
  const { setPageTitle } = usePageData();
  const user = useAppSelector((state) => state.user.userData);
  const userModulesPermissions = useAppSelector(
    (state) => state.user.userData?.modulePermission ?? [],
  );

  const hasAccessToEmpModule = useMemo(
    () =>
      hasModuleFeaturePermission(
        ModulesName.Employees,
        Permission.View,
        userModulesPermissions,
      ),
    [userModulesPermissions],
  );

  const canViewCompanyDashboard = useMemo(
    () =>
      user?.roleType === Roles.Administrator ||
      user?.roleType === Roles.HRManager ||
      user?.roleType === Roles.HRExecutive ||
      hasModuleFeaturePermission(
        ModulesName.Dashboard,
        Permission.ViewAll,
        userModulesPermissions,
      ),
    [user?.roleType, userModulesPermissions],
  );

  const hasAccessToJob = useMemo(
    () =>
      hasModuleFeaturePermission(
        ModulesName.Jobs,
        Permission.View,
        userModulesPermissions,
      ),
    [userModulesPermissions],
  );

  const hasAccessToNoticeBoard = useMemo(
    () =>
      hasModuleFeaturePermission(
        ModulesName.NoticeBoard,
        Permission.View,
        userModulesPermissions,
      ),
    [userModulesPermissions],
  );

  useEffect(() => {
    setPageTitle("");
  }, []);

  if (!user) {
    return (
      <Box className="dashboard-modern" sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  if (!canViewCompanyDashboard) {
    return (
      <Box className="dashboard-modern">
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid size={12}>
            <DashboardHeader fullName={user?.fullName || ""} />
          </Grid>
          <Grid size={{ xs: 12, lg: 8 }}>
            {hasAccessToNoticeBoard && <NoticeBoard />}
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={{ xs: 2, md: 3 }}>
              <UpComingHolidayAndEvents />
              <UpComingCelebration />
            </Stack>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box className="dashboard-modern">
      <Grid container spacing={{ xs: 2, md: 3 }} className="d-flex justify-content-between">
        <Grid size={12}>
          <DashboardHeader fullName={user?.fullName || ""} />
        </Grid>
        <Grid
          size={{
            xs: 12,
            lg: 8,
          }}
        >
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {hasAccessToEmpModule && (
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <EmployeeChart />
              </Grid>
            )}
            {hasAccessToEmpModule && <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <DepartmentChart />
            </Grid>}
            {hasAccessToJob && (
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <OpenPositions />
              </Grid>
            )}
            {hasAccessToJob && (
              <Grid
                sx={{ minHeight: 330 }}
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <ApplicationsChart />
              </Grid>
            )}

            <Grid size={12}>
              <Stack spacing={3}>
                {hasAccessToNoticeBoard && <NoticeBoard />}
                {/* <EmployeePerformance /> */}
              </Stack>
            </Grid>
          </Grid>
        </Grid>
        <Grid
          className="dashboard-side-column d-flex flex-column"
          size={{
            xs: 12,
            lg: 4,
          }}
        >
          {typeof Notification !== "undefined" && Notification.permission === "default" && <PushNotification />}
          {hasAccessToEmpModule && <EmpOnLeave />}
          <UpComingHolidayAndEvents />
          <UpComingCelebration />
          {/* <Punctual />
          <EmpOfMonth /> */}
          <Help />
        </Grid>
      </Grid>
    </Box>
  );
}
