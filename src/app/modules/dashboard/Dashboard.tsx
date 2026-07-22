import { Grid, Stack } from "@mui/material";
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
import { canAccessHrManagement, hasModuleFeaturePermission } from "../../../utils/common";
import { ModulesName, Permission } from "../../../utils/enums";
import { DashboardHeader } from "./components/DashboardHeader";
import { UpComingCelebration } from "./components/UpcomingCelebration";
import { PushNotification } from "./components/PushNotification";
import { UpComingHolidayAndEvents } from "./components/UpComingHolidayAndEvent";
import { usePageData } from "../../Context/PageDataProvider";

// Main Dashboard Component
export default function Dashboard() {
  const { setPageTitle } = usePageData();
  const user = useAppSelector((state) => state.user.userData)!;
  const userRoleType = useAppSelector(
    (state) => state.user.userData?.roleType!,
  );
  const modulePermission = useAppSelector(
    (state) => state.user.userData?.modulePermission,
  );

  const userModulesPermissions = useAppSelector(
    (state) => state.user.userData?.modulePermission ?? [],
  );
  const hasHrAccess = canAccessHrManagement(userRoleType);

  const hasAccessToEmpModule = useMemo(
    () =>
      hasHrAccess && hasModuleFeaturePermission(
        ModulesName.Employees,
        Permission.View,
        userModulesPermissions,
      ),
    [hasHrAccess, userModulesPermissions],
  );

  const hasAccessToJob = useMemo(
    () =>
      hasHrAccess && hasModuleFeaturePermission(
        ModulesName.Jobs,
        Permission.View,
        userModulesPermissions,
      ),
    [hasHrAccess, userModulesPermissions],
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

  return (
    <React.Fragment>
      <DashboardHeader fullName={user.fullName} />
      <Grid container spacing={2} className="d-flex justify-content-between">
        <Grid
          size={{
            xs: 12,
            lg: 8,
          }}
        >
          <Grid container spacing={3}>
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
            {hasHrAccess && <Grid
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
                sx={{ height: 310 }}
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
          className="d-flex flex-column gap-4"
          size={{
            xs: 12,
            lg: 4,
          }}
        >
          {Notification.permission == "default" && <PushNotification />}
          {hasHrAccess && <EmpOnLeave />}
          <UpComingHolidayAndEvents />
          <UpComingCelebration />
          {/* <Punctual />
          <EmpOfMonth /> */}
          <Help />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
