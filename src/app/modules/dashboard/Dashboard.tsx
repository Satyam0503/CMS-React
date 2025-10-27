import { Grid, Stack } from "@mui/material";
import { useIntl } from "react-intl";
import { useAppSelector } from "../../Redux/hooks";
import React, { useEffect, useMemo, useState } from "react";
import { EmployeeChart } from "./components/EmployeeChart";
import OpenPositions from "./components/OpenPositions";
import { ApplicationsChart } from "./components/ApplicationsChart";
import { DepartmentChart } from "./components/DepartmentChart";
import EmployeePerformance from "./components/EmployeePerformance";
import EmpOnLeave from "./components/EmpOnLeave";
import NoticeBoard from "./components/NoticeBoard";
import Help from "./components/Help";
import { hasModuleFeaturePermission } from "../../../utils/common";
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
  const intl = useIntl();

  const userModulesPermissions =
    useAppSelector((state) => state.user.userData?.modulePermission) ?? [];

  const hasAccessToEmpModule = useMemo(
    () =>
      hasModuleFeaturePermission(ModulesName.Employees, Permission.View, userModulesPermissions),
    [userModulesPermissions]
  );

  const hasAccessToJob = useMemo(
    () =>
      hasModuleFeaturePermission(ModulesName.Jobs, Permission.View, userModulesPermissions),
    [userModulesPermissions]
  );

  useEffect(() => {
    setPageTitle("");
  }, [])

  return (
    <React.Fragment>
      <DashboardHeader fullName={user.fullName} />
      <Grid
        container
        spacing={2}
        className="d-flex justify-content-between"
      >
        <Grid item xs={12} lg={8}>
          <Grid container spacing={3}>
            {hasAccessToEmpModule && (
              <Grid item xs={12} sm={6} className="h-100">
                <EmployeeChart />
              </Grid>
            )}
            {hasAccessToJob && (
              <Grid item xs={12} sm={6}>
                <OpenPositions />
              </Grid>
            )}
            {hasAccessToJob && (
              <Grid item xs={12} sm={6}>
                <ApplicationsChart />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <DepartmentChart />
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={3}>
                <NoticeBoard />
                <EmployeePerformance />
              </Stack>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} lg={4} className="d-flex flex-column gap-4">
          {
            Notification.permission == "default" &&
            <PushNotification />
          }
          <EmpOnLeave />
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
